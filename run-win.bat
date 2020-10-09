if exist .env for /f "delims=" %%i in (.env) do set %%i
nodemon dist/index.js