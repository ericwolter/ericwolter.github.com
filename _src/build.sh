#!/bin/sh

cd _secret/
node secret.js
cd ..
node _posts/posts.js

wintersmith build