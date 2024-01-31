package com.bokesoft.yigo2.service.heel.sample;

import java.util.HashMap;

public class StatusList {
	private static HashMap<Integer, String> _list = new HashMap<Integer, String>();
	private static StatusList _singletone = new StatusList();
	
	private StatusList() {
		// Initialize
		_list.put(100, "PREPARED");
		_list.put(200, "ENABLED");
		_list.put(300, "DISABLED");
	}
	
	public static StatusList getInstance() {
		return _singletone;
	}
	
	public Integer itemId(String code) { // 依据code获取id
		Integer result = -1;
		
        for (Integer i : _list.keySet()) {
        	String value = _list.get(i);
        	if (value.equals(code)) {
        		result = i;
        		break;
        	}
        }
        
		return result;
	}

	public String itemCode(Integer id) { // 依据id获取code
		String result = "";
		
        for (Integer i : _list.keySet()) {
        	String value = _list.get(i);
        	if (id.equals(i)) {
        		result = value;
        		break;
        	}
        }
        
		return result;
	}
}
