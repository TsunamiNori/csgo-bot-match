if exist .env for /f "delims=" %%i in (.env) do set %%i
cd dist
nodemon index.js
