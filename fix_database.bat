@echo off
echo ===== 修复数据库连接问题 =====
echo.

echo 1. 添加文件到Git...
git add .

echo 2. 提交更改...
git commit -m "Fix database connection: use env DATABASE_URL"

echo 3. 推送到GitHub...
git push

echo 4. 等待Railway自动部署...
echo 部署完成后，数据库应该会正确初始化

echo.
echo ===== 完成！ =====
pause