(function () {
	
	var obj = {
		NoDefineNodeType: "ノードタイプの定義{1}は存在しません！",
		ParticipatorError: "ノード{1}に参加者の人数が0になっています！",
		DelegateRightError: "ユーザーは管理者の権限を持ちませんので、操作者の代理データを編集できません！",
		CommitRightError: "現在ユーザーがワークアイテムをコミットできません！",
		InstanceStarted: "インスタンスは既に起動しました！",
		WorkitemDataTimeout: "ワーク項目は既にコミットしました！",
		NoActiveWorkitem: "ワーク項目は存在しません！",
		NoMApData: "マップノード{1}に中間層自動マップの対象データは存在しません！",
		NoProcessDefination: "プロセス{1}は存在しなく、または配置していません！",
		NoBindingProcess: "フォーム{1}とデータオブジェクト{2}にバンディングプロセスは存在しません！",
		NoDynamicBindingProcess: "フォームの動的バンディングプロセス{1}は存在しなく、または配置していません！",
		NoProcessDefinationVerID: "プロセス{1}にバージョン{2}の定義は存在しません！",
		NoInstanceData: "インスタンスデータは存在しません！",
		DelegateMissSrc: "ソース操作者は未設定です。",
		DelegateMissTgt: "ターゲット操作者は未設定です。",
		NoNodeExist: "番号が{1}のノードはインスタンス{2}に定義が存在しません！",
		NoBPMContext: "コンテキストにインスタンス情報が存在しませんので、公式{1}は実行できません。",
		RollbackError: "タイムアウトの為、ロールバックエラーが発生しました。",
		NoStandardForm: "標準承認フォーム“WorkflowAudit”の定義は存在しません！",
		NoForm: "フォームパラメータは存在しません！",
		NoPath: "ノード“{1}”にパスは存在しません！",
		MissAttachment: "番号{1}のフォームのプロセスは、プライマリ{2}の添付が未登録です！",
		StartInstance: "フロー開始",
		CommitWorkItem: "ワークアイテムのコミット",
		RevocateCommited: "承認の取り消し",
		StartTimeBeforeEndTime: "開始時間と終了時間が無効です。",
		InstancePaused: "インスタンスが停止しています。",
		CommitError: "現在の状態｛1｝ではワークアイテムがコミットできません。",
		CommitNOBacksite: "バックサイトを設定してください！",
		CommitNOBacksiteOpt: "バックサイトオペレーターのワークアイテムを設定してください！",
		TransitTo: "直送",
		OutOfParticipators: "オペレーター{1}はオペレーターリストに存在しません。",
		CommitNoTransitTo: "ワークアイテムの直送位置を設定してください。",
		DistributeNotSupport: "一般モードでは分配又はＰｒｅｅｍｐｔｉｏｎを対応しません"
	};

	if(YIUI.StringTable.BPM) {
		YIUI.StringTable.BPM = $.extend(YIUI.StringTable.BPM, obj);
	} else {
		YIUI.StringTable.BPM = $.extend(YIUI.StringTable, obj);
	}
	
})();