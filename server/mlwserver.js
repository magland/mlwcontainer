"use strict";

var express=require('express');

require('dotenv').config();

process.on('SIGINT', function() {
  cleanup(function() {
    process.exit(-1);
  });
});

process.on('SIGTERM', function() {
  cleanup(function() {
    process.exit(-1);
  });
});

var port_range_str=process.env.PORT_RANGE||'32001-33000';
var max_num_containers=process.env.MAX_NUM_CONTAINERS||2;

var tmp=port_range_str.split('-');
var port_range=[Number(tmp[0]),Number(tmp[1])];

var container_manager=new ContainerManager();
container_manager.setPortRange(port_range);
container_manager.setMaxNumContainers(max_num_containers);
container_manager.startSpawning();

const app = express();
app.set('port', (process.env.PORT || 7044));
app.use(function(req,res,next) {
  if (req.method == 'OPTIONS') {
    //allow cross-domain requests
    res.set('Access-Control-Allow-Origin','*');
    res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.set("Access-Control-Allow-Credentials", true);
    res.set("Access-Control-Max-Age", '86400'); // 24 hours
    res.set("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization");
    res.status(200).send();
    return;
  }
  res.header("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization");
  next();
});
app.get('/attachToContainer', handle_attach_to_container);

///////////////////////////////////////////////////////////////////////////
//const port=app.get('port');
//app.listen(port, function() {
//  console.info('mlwserver is running on port', port);
//});

if (process.env.SSL != null ? process.env.SSL : port%1000==443) {
  const options = {
    key:fs.readFileSync(__dirname+'/encryption/privkey.pem'),
    cert:fs.readFileSync(__dirname+'/encryption/fullchain.pem'),
    ca:fs.readFileSync(__dirname+'/encryption/chain.pem')
  };

  require('https').createServer(options,app).listen(port,function() {
    console.info('mlwserver is running https on port', port);
  });
}
else {
  app.listen(port, function() {
    console.info('mlwserver is running on port', port);
  });
}

///////////////////////////////////////////////////////////////////////////
function handle_attach_to_container(req,res) {
  const query = req.query;
  const filename = req.params.file;

  const send_json_response = function(status, obj) {
    res.status(status).json(obj);
  };

  container_manager.attachToContainer(function(err,C) {
    if (err) {
      send_json_response(200,{success:false,error:err});
      return;
    }
    send_json_response(200,{success:true,port:C.port()});
  });
}

///////////////////////////////////////////////////////////////////////////
function cleanup(callback) {
  container_manager.stopAllContainers(function() {
    callback();
  });
}

///////////////////////////////////////////////////////////////////////////////////////
function ContainerManager() {
  var that=this;

  this.setPortRange=function(range) {m_port_range=[range[0],range[1]];};
  this.setMaxNumContainers=function(max_num_containers) {m_max_num_containers=max_num_containers;};
  this.attachToContainer=function(callback) {attachToContainer(callback);};
  this.detachFromContainer=function(cname) {detachFromContainer(cname);};
  this.startSpawning=function() {startSpawning();};
  this.stopAllContainers=function(callback) {stopAllContainers(callback);};

  var m_running_containers={};
  var m_max_num_containers=0;
  var m_started_spawning=false;
  var m_port_range=[];
  var m_stopping_all_containers=false;

  function attachToContainer(callback) {
    for (var cname in m_running_containers) {
      if ((m_running_containers[cname].isRunning())&&(!m_running_containers[cname].isAttached())) {
        m_running_containers[cname].setAttached(true);
        callback(null,m_running_containers[cname]);
        return;
      }
    }
    callback('No available running containers.');
  }

  function startSpawning() {
    if (m_started_spawning) return;
    m_started_spawning=true;

    setTimeout(function() {
      on_timer();
    },1000);
  }

  function stopAllContainers(callback) {
    m_stopping_all_containers=true;
    console.log ('Stopping all containers...');
    for (var cname in m_running_containers) {
      if (m_running_containers[cname].isRunning())
        m_running_containers[cname].stop();
    }
    wait_for_no_more_containers_running(callback);
    function wait_for_no_more_containers_running(cb) {
      console.log ('Waiting for containers to stop.');

      var something_running=false;
      for (var cname in m_running_containers) {
        if (m_running_containers[cname].isRunning()) {
          something_running=true;
        }
      }
      if (!something_running) {
        m_stopping_all_containers=false;
        callback();
      }
      else {
        setTimeout(function() {
          wait_for_no_more_containers_running();
        },1000);
      }
    }
  }

  function detachFromContainer(cname) {
    if (m_running_containers[cname]) {
      if (m_running_containers[cname].isRunning()) {
        m_running_containers[cname].stop();
      }
    } 
  }

  function on_timer() {

    if (!m_stopping_all_containers) {
      var num_running=0;
      var occupied_ports={};
      for (var cname in m_running_containers) {
        if (m_running_containers[cname].isRunning()) {
          num_running++;
          occupied_ports[m_running_containers[cname].port()]=true;
        }
        else {
          console.log ('Removing container: '+cname)
          delete m_running_containers[cname];
        }
      }

      if (num_running<m_max_num_containers) {
        var port=find_free_port(m_port_range,occupied_ports);
        if (port) {
          var C=new Container();
          C.start({port:port});
          m_running_containers[C.containerName()]=C;
        }
        else {
          console.log ('Could not start container: no free ports')
        }
      }
    }

    setTimeout(function() {
      on_timer();
    },1000);
  }

  function find_free_port(range,occupied) {
    for (var i=Number(range[0]); i<=Number(range[1]); i++) {
      if (!occupied[i]) return i;
    }
    return null;
  }
}

///////////////////////////////////////////////////////////////////////////////////////
function Container() {
  var that=this;

  this.start=function(opts) {start(opts);};
  this.stop=function() {stop();};
  this.isRunning=function() {return m_is_running;};
  this.port=function() {return m_port;};
  this.error=function() {return m_error;};
  this.containerName=function() {return m_container_name;};
  this.isAttached=function() {return m_is_attached;};
  this.setAttached=function(val) {m_is_attached=val;};

  var m_port=0;
  var m_process=null;
  var m_is_running=false;
  var m_error='';
  var m_container_name='mlwc_'+make_random_id(8);
  var m_is_attached=false;

  function start(opts) {
    m_port=opts.port;

    console.log ('Starting container on port '+m_port);

    var exe='docker';
    var argstr=`run -p ${m_port}:8888 --name=${m_container_name} -t mlwc`
    var args=(argstr).split(' ');
    try {
      m_process=require('child_process').spawn(exe,args,opts);
    }
    catch(err) {
      console.error(err);
      m_error=err.message;
      return;
    }
    m_is_running=true;

    var P=m_process;
    var console_txt='';
    P.stdout.on('data',function(chunk) {
      console_txt+=chunk;
      process.stdout.write(''+chunk);

      // The following is a terrible hack. We'll need to replace it with something better later.
      // When user closes browser tab we often get message "Starting buffering for"
      // So this closes the session in that circumstance
      var ind=console_txt.indexOf('Starting buffering for');
      if (ind>=0) {
        console.log ('Log output included "Started buffering for", so we are closing the server.');
        stop();
      }
    });
    P.stderr.on('data',function(chunk) {
      console_txt+=chunk;
      process.stdout.write(''+chunk);
    });
    P.on('close',function(code) {
      m_is_running=false;
    });
  }
  function stop() {
    console.log ('killing and removing container: '+m_container_name);
    require('child_process').spawn('docker',['rm','-f',m_container_name],{detached:true});
  }

  function make_random_id(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < len; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

}