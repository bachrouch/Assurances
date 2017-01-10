var _ = require('underscore');
module.exports = function (grunt) {
  var confFiles = ['package.json', 'bower.json', 'processes.json'];
  var serverFiles = ['*.js', 'routes/*.js', 'logic/*.js', 'logic/**/*.js',
    'test/*.js', 'batch/*.js'
  ];
  var clientFiles = ['public/js/app.js', 'apps/**/*.js'];
  var cssFiles = ['public/css/*.css'];
  var jsFiles = _.union(confFiles, serverFiles, clientFiles);
  var modules = ['common', 'connection', 'index', 'actors', 'auto',
    'assistance', 'loan', 'finance', 'admin', 'family', 'mySpace',
    'configs', 'smsapi'
  ];
  var gruntConfig = {
    pkg: grunt.file.readJSON('package.json'),
    mkdir: {
      all: {
        options: {
          create: ['data', 'data/pm2', 'data/printing',
            'data/printing/quote', 'data/printing/cp',
            'data/printing/receipt', 'data/printing/attestation',
            'batch/data', 'batch/data/pm2', 'batch/data/log',
            'batch/data/debit'
          ]
        }
      }
    },
    jsbeautifier: {
      options: {
        js: {
          indentSize: 2,
          jslintHappy: true,
          wrapLineLength: 80,
          braceStyle: 'end-expand',
          preserveNewlines: false,
          breakChainedMethods: true
        },
        css: {
          indentSize: 2
        }
      },
      js: {
        files: {
          src: jsFiles
        },
      },
      css: {
        files: {
          src: cssFiles
        },
      }
    },
    jshint: {
      conf: {
        files: {
          src: confFiles
        },
        options: {
          force: true,
          jshintrc: true
        }
      },
      client: {
        files: {
          src: clientFiles
        },
        options: {
          force: true,
          jshintrc: true
        }
      },
      server: {
        files: {
          src: serverFiles
        },
        options: {
          force: true,
          jshintrc: true
        }
      }
    },
    concat: null,
    uglify: null,
    mochaTest: {
      test: {
        src: ['test/*.js']
      }
    },
    watch: {
      dev: {
        files: ['apps/**/*.js'],
        tasks: ['concat']
      },
      prod: {
        files: ['apps/**/*.js'],
        tasks: ['concat', 'uglify']
      }
    },
    nodemon: {
      dev: {
        script: 'index.js',
        options: {
          cwd: __dirname,
          ext: 'js,jade',
          watch: _.union(serverFiles, ['views']),
          env: {
            TAKAFUL_MONGO_URI: 'mongodb://localhost/takaful',
            TAKAFUL_PRINT_SRV: 'localhost',
            TAKAFUL_PRINT_PORT: '3001'
          }
        }
      },
      prod: {
        script: 'index.js',
        options: {
          cwd: __dirname,
          ext: 'js,jade',
          watch: _.union(serverFiles, ['views']),
          env: {
            NODE_ENV: 'production',
            TAKAFUL_MONGO_URI: 'mongodb://localhost/takaful',
            TAKAFUL_PRINT_SRV: 'localhost',
            TAKAFUL_PRINT_PORT: '3001'
          }
        }
      },
      batch: {
        script: 'batch/app.js',
        options: {
          cwd: __dirname,
          ext: 'js,jade',
          watch: _.union(serverFiles, ['views']),
          env: {
            TAKAFUL_MONGO_URI: 'mongodb://localhost/takaful'
          }
        }
      },
      debitBatch: {
        script: 'batch/debitPayments.js',
        options: {
          cwd: __dirname,
          ext: 'js,jade',
          watch: _.union(serverFiles, ['views']),
          env: {
            TAKAFUL_MONGO_URI: 'mongodb://localhost/takaful'
          }
        }
      }
    }
  };
  var concatConfig = _.map(modules, function (mod) {
    return {
      src: ['apps/' + mod + '/*.js', 'apps/' + mod + '/**/*.js'],
      dest: 'public/js/' + mod + '.js'
    };
  });
  gruntConfig.concat = _.object(modules, concatConfig);
  var uglifyConfig = _.map(modules, function (mod) {
    var r = {
      files: {}
    };
    r.files['public/js/' + mod + '.js'] = 'public/js/' + mod + '.js';
    return r;
  });
  gruntConfig.uglify = _.object(modules, uglifyConfig);
  grunt.initConfig(gruntConfig);
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.registerTask('init', ['mkdir']);
  grunt.registerTask('check', ['jsbeautifier', 'jshint']);
  grunt.registerTask('build:dev', ['check', 'concat']);
  grunt.registerTask('build:prod', ['check', 'concat', 'uglify']);
  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('start:dev', ['build:dev', 'nodemon:dev']);
  grunt.registerTask('start:prod', ['build:prod', 'nodemon:prod']);
  grunt.registerTask('start:batch', ['nodemon:batch']);
  grunt.registerTask('start:debitBatch', ['nodemon:debitBatch']);
};
