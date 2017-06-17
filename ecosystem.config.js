module.exports = {
  apps: [{
    name: 'ScratchPad',
    script: './app.js'
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-54-227-228-8.compute-1.amazonaws.com',
      key: '~/.ssh/ApostateNode.pem',
      ref: 'origin/master',
      repo: 'https://github.com/JTOmland/nodeTutorial.git',
      path: '/home/ubuntu/nodeTutorial',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}