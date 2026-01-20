<?php
// Shared hosting fallback: ensure "/" serves the Vite build even if the host prefers index.php.
// This file is safe to deploy alongside the static build.

$indexPath = __DIR__ . DIRECTORY_SEPARATOR . 'index.html';
if (!is_file($indexPath)) {
  http_response_code(500);
  header('Content-Type: text/plain; charset=utf-8');
  echo "Missing index.html in " . __DIR__;
  exit;
}

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache');
readfile($indexPath);

