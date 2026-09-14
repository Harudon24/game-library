# コトダマン

`index.html` から、所持キャラ一覧と降臨一覧を確認する静的ページです。画像はリポジトリに含めず、JSONデータをJavaScriptで表示します。

## 所持キャラ

- `owned-characters.html`: 所持キャラ一覧
- `owned-characters.json`: 2026-09-14に提供された所持画像から登録した基礎データ
- `owned-characters-manual.json`: 画像登録後に追加したキャラ。現在は「ましろ」を記録
- `owned-characters.js`: 基礎データと手動追加データを結合して表示

進化素材は掲載しません。`unevolved: true` は登録画像に「未進化」表示あり、falseは表示なし、nullは未確認です。falseを進化済みと断定しません。文字は登録画面の代表1文字で、利用可能な全ての文字ではありません。Lv・福は未転記です。

新しいキャラを追加するときは、基本的に `owned-characters-manual.json` に追加します。同名版がある場合は衣装名・属性などで区別します。

## 降臨・満福管理

- `descents.html`: コラボを除く通常降臨の一覧
- `descents.json`: 降臨名・難易度。GameWithの降臨一覧を基準に作成
- `descent-status.json`: 福・満福などユーザー個別の進捗
- `descents.js`: 所持キャラデータと照合し、所持/未所持・満福状況を表示

コラボ降臨は `descents.json` には含めません。非コラボの季節系通常降臨は含みます。特殊イベント形式のクエストは、通常降臨一覧とは別扱いにする場合があります。

`descent-status.json` の例:

```json
{
  "updated": "2026-09-14",
  "statuses": {
    "ウラミ": {"fuku": 99, "max_fuku": 99, "full": true, "note": ""},
    "ムオン": {"fuku": 72, "max_fuku": 99, "full": false, "note": ""}
  }
}
```

ユーザーから「○○が満福」「○○は福72」のような報告を受けたら、このファイルだけ更新すれば一覧へ反映できます。

所持キャラデータは2026-09-14提供画像を元に開始。キャラ名は各レコードのGameWith参照先と照合しています。元スクリーンショットはリポジトリに含めません。
