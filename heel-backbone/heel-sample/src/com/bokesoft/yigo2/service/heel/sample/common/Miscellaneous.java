package com.bokesoft.yigo2.service.heel.sample.common;

/**
 * @author guojs
 * 一些杂项功能
 */

public class Miscellaneous {
	public static Integer randomInt(Integer min, Integer max) { // 在指定范围，随机获取一个整数, 输出结果范围[min, max)
		return (int)Math.floor(Math.random() * (max - min) + min);
	}
}
