/**
 * 
 */
package com.bokesoft.yigo2.service.heel.sample;

import java.util.ArrayList;

import com.bokesoft.yigo.mid.base.DefaultContext;
import com.bokesoft.yigo.mid.service.IExtService;

/**
 * @author guojs
 *
 */
public class Hello implements IExtService {

	@Override
	public Object doCmd(DefaultContext arg0, ArrayList<Object> arg1) throws Throwable {
		return "您好！Hello!";
	}

}
