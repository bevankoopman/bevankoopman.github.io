#rsync -avz --delete . bevan@koopman.id.au:~/koopman.id.au
git push
ssh bevan@koopman.id.au 'cd koopman.id.au && git pull'
