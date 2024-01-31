var plug_in = {
		IMAGE_HEIGHT : "The width of the display box should not be smaller than the head frame," +
				"and the height should be at highter than the head frame height 50px",
		IMAGE_FILEERROR : "Select file error,the picture type must be",
		IMAGE_BILDERTYPE : "one of the",
		RICHEDITOR_TEST : "The page was detected without reference to jQuery,please quote first,otherwise the wangEditor will not be available.",
		RICHEDITOR_CANNOT : "Detects that window.jQuery has been modified and the wangEditor will not be available.",
		RICHEDITOR_ARIAL : 'Song typeface',
		RICHEDITOR_BLACKBODY : 'blackbody',
		RICHEDITOR_REGULARSCRIPT : 'Regular script',
		RICHEDITOR_OFFICIALSCRIPT : 'Official script',
		RICHEDITOR_YOUYUAN : 'youyuan',
		RICHEDITOR_MICROSOFTYAHEI : 'Microsoft YaHei', 
		RICHEDITOR_MARROON : 'marroon',
        RICHEDITOR_PURPLE : 'purple',
        RICHEDITOR_RED : 'red',
        RICHEDITOR_BRIGHTPINK : 'Bright pink',
        RICHEDITOR_MAZARINE : 'mazarine',
        RICHEDITOR_BLUE : 'blue',
        RICHEDITOR_LAKEBLUE : 'Lake blue',
        RICHEDITOR_BLUSHGREEN : 'Bluish green',
        RICHEDITOR_GREEN : 'green',
        RICHEDITOR_OLIVE : 'olive',
        RICHEDITOR_RESEDA : 'reseda',
        RICHEDITOR_AURANTIUS : 'aurantius',
        RICHEDITOR_GRAY : 'gray',
        RICHEDITOR_SILVER : 'silver',
        RICHEDITOR_BLACK : 'black',
        RICHEDITOR_WHITE : 'white',
        RICHEDITOR_INSERTEXPRESSION : "In actual projects,emoticons should be cofigured to your own server(faster),or multiple groups of expressions can be configured,please refer to the document." +
        		"  \n\n\n   【The pop-up box will not appear in the actual project】",
        RICHEDITOR_INSERTIMAGE : "In the actual project,you can consult the configuration file and configure how to upload the local picture (support across domains)   \n\n\n    【The pop-up box will not appear in the actual project】",
        RICHEDITOR_INSERTCODE : "In the actual project,you can cofigure the highlighted code,refer to the document     \n\n\n    【The pop-up box will not appear in the actual project】",
        RICHEDITOR_INSERTPICTURE : "insert local picture",
        RICHEDITOR_INSERT : 'insert',
		RICHEDITOR_SUBMIT : 'submit',
		RICHEDITOR_UPDATE : 'update',
		RICHEDITOR_CANCEL : 'cancel',
		RICHEDITOR_CLOSE : 'close',
		RICHEDITOR_UPLOAD : 'upload',
		RICHEDITOR_UNSAFEALERT : 'The input is not safe,please re-enter!',
		RICHEDITOR_FORMATERROR : 'Input formatting error,please re-enter!',
		RICHEDITOR_UNCHECKED : 'Unselected edit area,unable to perform operation',
		RICHEDITOR_PROMPT : 'wangEditor perompt: use textarea to expand the rich text box.',
		RICHEDITOR_EVENT : 'A two wangEditor() event cannot be executed for a textarea'
		
};


if(YIUI.I18N) {
	YIUI.I18N = $.extend(YIUI.I18N, plug_in);
}else {
	YIUI.I18N = plug_in;
}