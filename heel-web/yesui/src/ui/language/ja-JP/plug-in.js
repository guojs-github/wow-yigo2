var plug_in = {
		IMAGE_HEIGHT : "表示ボックスの幅がイメージボックスより大きい、且つ高さがイメージボックスより50px以上高くように設定してください。",
		IMAGE_FILEERROR	: "選択したファイルのイメージタイプは誤っています。イメージタイプを",
		IMAGE_BILDERTYPE : "に設定してください。",
		RICHEDITOR_TEST	: "画面にjQueryへの引用は存在しませんので、wangEditorは使用できません。",
		RICHEDITOR_CANNOT : "window.jQuery が変更されましたので、wangEditorは使用できません。",
		RICHEDITOR_ARIAL : 'SimSun',
		RICHEDITOR_BLACKBODY : 'SimHei',
		RICHEDITOR_REGULARSCRIPT : 'KaiTi',
		RICHEDITOR_OFFICIALSCRIPT : '隷書',
		RICHEDITOR_YOUYUAN : '丸ゴシック',
		RICHEDITOR_MICROSOFTYAHEI : 'Microsoft YaHei', 
		RICHEDITOR_MARROON : '濃い赤',
        RICHEDITOR_PURPLE : '紫色',
        RICHEDITOR_RED : '赤色',
        RICHEDITOR_BRIGHTPINK : 'ピンク',
        RICHEDITOR_MAZARINE : '紺碧',
        RICHEDITOR_BLUE : '青色',
        RICHEDITOR_LAKEBLUE : '水色',
        RICHEDITOR_BLUSHGREEN : '緑青',
        RICHEDITOR_GREEN : '緑色',
        RICHEDITOR_OLIVE : '新緑',
        RICHEDITOR_RESEDA : '青磁',
        RICHEDITOR_AURANTIUS : 'オレンジ',
        RICHEDITOR_GRAY : '灰色',
        RICHEDITOR_SILVER : '銀色',
        RICHEDITOR_BLACK : '黒色',
        RICHEDITOR_WHITE : '白色',
        RICHEDITOR_INSERTEXPRESSION : "実際のプロジェクトでは顔文字をローカルサーバーに配置する必要があり（速度が速いです）、何セット配置することも可能です。資料を参照してください。\n\n\n【本ポップアップダイアログは実際のプロジェクトで表示しません。】",
        RICHEDITOR_INSERTIMAGE : "実際のプロジェクトでは設定ファイルを確認しながら、ローカルから画像のアップロードを設定することが可能です（ドメインの跨ぎも対応）。\n\n\n【本ポップアップダイアログは実際のプロジェクトで表示しません。】",
        RICHEDITOR_INSERTCODE : "コードハイライトの設定が可能です。資料を参照してください。\n\n\nを【本ポップアップダイアログは実際のプロジェクトで表示しません。】",
        RICHEDITOR_INSERTPICTURE : "ローカルから画像を選択します。",
        RICHEDITOR_INSERT : '挿入',
		RICHEDITOR_SUBMIT : 'サブミット',
		RICHEDITOR_UPDATE : '更新',
		RICHEDITOR_CANCEL : 'キャンセル',
		RICHEDITOR_CLOSE : '終了',
		RICHEDITOR_UPLOAD : 'アップロード',
		RICHEDITOR_UNSAFEALERT : '内容に誤りがありますので、再入力してください！',
		RICHEDITOR_FORMATERROR : 'フォーマットは誤っています。再入力してください！',
		RICHEDITOR_UNCHECKED : '編集エリアを選択してください。',
		RICHEDITOR_PROMPT : 'wangEditor提示：textarea拡張リッチテキストボックスを使用してください。',
		RICHEDITOR_EVENT : '一つのtextareaに対してはwangEditor()イベントを1回のみ実行します。'
		
};

var YIUI = YIUI || {};
if(YIUI.I18N) {
	YIUI.I18N = $.extend(YIUI.I18N, plug_in);
}else {
	YIUI.I18N = plug_in;
}