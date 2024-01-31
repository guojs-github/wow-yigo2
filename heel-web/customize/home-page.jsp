<%@page import="org.slf4j.Logger"%>
<%@page import="org.slf4j.LoggerFactory"%>
<%@page import="java.text.SimpleDateFormat"%>
<%@page import="java.util.Date"%>

<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
	Logger logger = LoggerFactory.getLogger("home page");
	logger.info("Start of home-page.jsp =================================");

	String url = "index.html#/home-page";
	Date now = new Date();
	SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	String nowStr = f.format(now); logger.info("now=" + nowStr);

	response.sendRedirect(url + "?now=" + nowStr);

	logger.info("end of home-page.jsp =================================");
%>