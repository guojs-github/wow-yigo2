@rem 备份文件到开发目录
copy .\login_src.jsp D:\workspace\GitHub\wow-yigo2\heel-web
copy .\main_pure_src.jsp D:\workspace\GitHub\wow-yigo2\heel-web
xcopy .\heel-web D:\workspace\GitHub\wow-yigo2\heel-web\heel-web /s /Y
xcopy .\yesui\src D:\workspace\GitHub\wow-yigo2\heel-web\yesui\src /s /Y
xcopy .\customize D:\workspace\GitHub\wow-yigo2\heel-web\customize /s /Y

pause