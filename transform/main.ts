import { builders, namedTypes } from "ast-types";
import type { API, FileInfo } from "jscodeshift";

export default function transformer(file: FileInfo, api: API) {
	const j = api.jscodeshift.withParser("tsx"); // TSXパーサーを使用

	return j(file.source)
		.find(j.JSXAttribute, { name: { name: "style" } })
		.forEach((path) => {
			const value = path.node.value;
			if (!value || value.type !== "JSXExpressionContainer") return;

			const expr = value.expression;

			// ① style={[...]} の場合
			if (namedTypes.ArrayExpression.check(expr)) {
				const elements = expr.elements.filter((e) => e !== null) as namedTypes.Expression[]; // `null` 要素を除外

				if (elements.length === 0) {
					// 空配列なら変換しない
					return;
				}

				let newExpression: namedTypes.Expression;
				if (elements.length === 1) {
					// 要素が1つなら `{ a.flex_1 }` の形にする
					newExpression = elements[0];
				} else {
					// 複数要素なら `{ ...a.flex_1, ...a.px_lg }` に変換
					const spreadProps = elements.map(
						(element) =>
							namedTypes.SpreadElement.check(element) ? element : builders.spreadElement(element as any), // 型の不整合を回避
					);

					newExpression = builders.objectExpression(spreadProps as any); // 型の不整合を回避
				}

				// `JSXExpressionContainer` でラップ
				path.node.value = j.jsxExpressionContainer(newExpression as any);
			}
			// ② 既に `{ ...a.flex_1 }` の形になっている場合
			else if (namedTypes.ObjectExpression.check(expr)) {
				const props = expr.properties as any[]; // ここも `any` を適用して型エラーを回避

				if (props.every((prop) => namedTypes.SpreadElement.check(prop))) {
					let newExpression: namedTypes.Expression;
					if (props.length === 1) {
						// `{...a.flex_1}` → `{a.flex_1}`
						newExpression = (props[0] as namedTypes.SpreadElement).argument;
					} else {
						newExpression = expr;
					}

					// `JSXExpressionContainer` でラップ
					path.node.value = j.jsxExpressionContainer(newExpression as any);
				}
			}
		})
		.toSource({ quote: "single" }); // シングルクォートで出力
}
