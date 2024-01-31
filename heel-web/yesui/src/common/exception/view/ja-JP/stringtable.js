(function () {
	
	var obj = {
		NoTableData: "テーブル{1}にデータは存在しません！",
		NoBindingTableData: "コンポーネント{1}のバンディングテーブル{2}にデータは存在しません！",
		CircleDependency: "請求書{1}に計算のサイクルが存在しています！",
		GridExpandOrGroupInGridPage: "グリッドに行／列の拡張またはグループが存在していますので、ページングはできません！",
		ExistGroupRowInGridPage: "グリッドはページングした場合、グループ行（合計行）があります。",
		DefaultFormulaValueExistBothInCellAndEmb: "公式はセル及び埋め込みにも定義しました。",
		OuterColumnMustBeTitle: "拡張列の第一階層コラムをタイトル型に定義してください",
		UndefinedPageLoadType: "ページングタイプの定義に誤りがあります！",
		UnableToGetCellBehavior: "セルの動的行為は取得できません！",
		CheckRuleNotPass: "コンポーネント {1} のチェックルールに失敗しました。",
		EmbedSubBindingError: "グリッドの埋め込み定義に誤りがあります！",
		FormulaIdentifierError: "公式識別子の定義に誤りがあります！",
		DataBindingError: "コンポーネントデータのバンディングエラーが発生しました。データソースは存在しません！",
		NoRowSelected: "行を選択してください！",
		SequenceNoDefine: "シーケンス番号の定義は存在しません！",
		LayerOrHiddenNoDefine: "設定に誤りがあります。グリッド階層のデータを表示するにはLayerとHiddenフィールドが必要です。",
		ShowLayerDataNotAllowGridExpand: "グリッド階層データの表示は列拡張を対応しません！",
		RequiredError: "{1} を入力してください",
		NoComponentFound: "コンポーネントの定義は存在しません！",
		ForeignFieldsInequality: "フィルター関連のソースフィールドとターゲットフィールドの数は一致しません！",
		NoTableFound: "テーブルは存在しません！",
		NoEmptyRowFound: "プッシュ先のグリッドに空白行は存在しません！",
		GridTreeColumnDefineError: "ツリーコラム型の定義に誤りがあります！",
		UndefinedRowExpandType: "行拡張タイプの定義は存在しません。",
		RefOperationNotDefined: "フォーム{1}が引用する操作{2}の定義は存在しません！",
		NoDetailRowDefine: "グリッドに明細行の定義は存在しません！",
		ComponentNotExists: "{1}は存在しません。",
		NoRefDetailTableKeyDefine: "カスタマイズセルフォームのデータソースにRefDetailTableKeyの定義は存在しません！",
		NoRefTableKeyDefine: "子明細フォームのデータソースにRefTableKeyの定義は存在しません！",
		NoExpandSourceGet: "列拡張でカスタマイズの拡張ソースは計算できません。設定を確認してください。",
		UndefinedSubDetailLinkType: "子明細リンクタイプの定義は存在しません！",
		NoSubDetailsInEmptyRow: "グリッド中のデータ行を先に編集してください！",
		NoGridOrListViewFound: "関連のグリッドまたはリストニューは存在しません！",
		CellMergeDefineError: "セル結合定義の行タイプは一致しません！",
		SourceTypeDefineError: "ドロップダウンリストのソース定義に誤りがあります！",
		
		NoCellCannotSetValue: "セルではありませんので、値の設定はできません！",
		CannnotGetNoCellValue: "セルではありませんので、値の取得はできません！",
		CompdictCannotSetMultidict: "コンパウンド辞書{1}はマルチ辞書に設定できません。",
		DynamicdictItemkeyNull: "動的辞書{1}のitemKeyフィールドはヌルになっています！",
		CompdictItemkeyNull: "コンパウンド辞書{1}のitemKeyフィールドはヌルになっています！",
		NoComponent: "タグ名が{1}のコンポーネントは存在しません！",
		NoWidthOrHeight: "幅と高さの定義は存在しません！",
		NoKeyTargetBill: "プッシュ先フォームのキーは存在しません！",
		ExceedValueMaxAccuracy: "最大値を超えました！",
		DateDiffParamError: "DateDiff公式に引き渡すパラメータの誤りがあります。設定を確認してください！",
		NoComponentKey: "コンポーネント{1}は存在しません。設定を確認してください！",
		NeedPrimarysDefined: "グリッドはバックグラウンドページングであり、且つ選択フィールドがありますので、データソーステーブルにOID列が存在しない場合、ビジネスプライマリ列の定義が必要です。",
		TypeFormulaNeeded: "動的セルはタイプ公式の定義が必要です。",
		TypeGroupUnDefined: "フォーム{1}に動的セル関連の定義は存在しません！",
		TypeDefUnDefined: "{1}に合わせる動的セルの定義は存在しません！",
		TypeDefKeyColumnUndefined: "動的セルキー列{1}の定義は存在しません！",
		TypeDefKeyEmpty: "データに動的セルキーは空です。",
		UnknownDetailType: "未知の明細データタイプ{1}です。",
		ExpandSourceUndefined: "グリッド列{1}に拡張ソースの定義が存在しませんので、拡張タイプは確定できません。",
		ExpandColumnKeyUndefined: "グリッド列 {1}に拡張データソースの定義は存在しません！",
		ViewFormOnly: "メソッド{1}はビュー型のフォームのみに適用します。",
		DeleteRowWithSubDetail: "該当行及び子明細データを全て削除しますか?",
		DeleteRowWithChildRows: "現在行及び行中のデータを削除しますか?",
		DeleteAllSelectRows: "選択した行を全て削除しますか?",
		ConfirmClose: "画面を終了しますか？",
		UnSupportRowExpandType: "行拡張タイプは対応しません！{1}",
		NoEntryRights: "メニュ－エントリ権限 {1}はありません！",
		ListViewNotFound: "日記帳にリストビューコンポーネントは存在しません。",
		ItemKeyColumnUndefined: "動的辞書またはコンパウンド辞書{1}にデータソースItemKey列の定義は存在しません！",
		DictDataError: "辞書{1}の値型は誤ります。一般辞書はLong、マルチ辞書はStringに設定してください！",
		AttachmentExceedMaxSize: "アップロードファイルサイズは上限{1}KBを超えました！",
		ConnectFailed: "接続は失敗しました。ネットワークの設定を確認して、再試行してください！",
		FormCheckError: "フォーム{1}は誤っています",
		GridRowError: "グリッド{1}中の{2}行目に誤りが存在します。",
		GridCellError: "グリッド{1}に{2}行目の{3}は誤っています。",
		GridCellRequired: "グリッド{1}の{2}行目のセル{3}は入力必須",
		
		VeCannotNull: "veに値を入力してください",
		NoLoadHandlerClass: "{1}はハンドラークラスをロードしていません！",
		DictRootNodeCalcError: "辞書ルートノードの計算に誤りがあります。",
		ItemkeyNotAgreeWithCurrent: "辞書ルートノードitemKey{1}は現在辞書itemKey{2}と一致していません。",
		ItemkeyNoCompDict: "itemkey:{1}はコンパウンド辞書ではありません。",
		NoDict: "ItemKey:{1}の辞書は存在しません。",
		NoComponentBuilderClass: "{1},{2} は関連のコンポーネントビルダークラスが存在しません。",
		UnitNotSupportType: "IUnitConverter は{1}を対応しません。",
		NotSupportType: "{1}は対応しません。",
		DictInputValueTypeError: "辞書が引き渡す値の型:{1}は正しくありません。",
		TimeError: "時間:{1}は正しくありません。",
		filterDependenceUntreatedType: "filterDependenceに型:{1}は処理していません。",
		CompdictNotDataBinding: "複数選択のコンパウンド辞書 {1}にはデータにベンディングするフィールドの存在が許可されません。",
		UnEqualParamNum: "{1} パラメータの数が一致していません",
		AttachmentTypeError: "添付タイプ｛１｝は正しくありません",
		RadioButtonNoGroupKey: "ラジオボタン｛1｝の所属グループキーの定義は存在しません。"
	};
	
	if(YIUI.StringTable.View) {
		YIUI.StringTable.View = $.extend(YIUI.StringTable.View, obj);
	} else {
		YIUI.StringTable.View = $.extend(YIUI.StringTable, obj);
	}

})();
	