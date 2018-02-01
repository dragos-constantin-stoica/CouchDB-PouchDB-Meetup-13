//Webix Proxy for PouchDB
//pdb is the global variable pointing to PouchDb database
webix.proxy.proxyPouchDB = {
    $proxy:true,

    load:function(view, callback){
        //Build JSON Array from database
        
        pdb.query('tag', {
            key: this.source,
            include_docs: true
        }).then(function (result) {
          // handle result
          var todo_data = [];
          todo_data = result.rows.reduce(function(acc, crt){
              crt.doc.id = crt.doc._id;
              acc.push(crt.doc);
              return acc;
          }, []);
          view.parse(todo_data, 'json');
        }).catch(function (err) {
          console.log(err);
        });
    },
        
    save:function(view, update, dp, callback){
        function postProcessing(response){
            console.log(response);
            console.log(view.getItem(update.data["id"]));
        }
        
        //your saving pattern
        if(update.operation == "update"){
			//already having an _id
            /*
			pdb.put(update.data).then(function (response) {
			  // handle response
             
				var item = view.getItem(update.data["id"]);
				item._rev = response.rev;
				view.updateItem(update.data["id"],item);
				view.refresh();	
				webix.dp(view).reset();
                
                confirm('Task updated!');
                
                webix.message("Task updated");
			}).catch(function (err) {
			  console.log(err);
			});
            */
            pdb.put(update.data, 
            function(err, response) {
              if (err) { return console.log(err); }
              // handle response
              webix.message("Task updated");
              console.log("pufi!");
              postProcessing(response);
            });
        
            
		}

		if(update.operation == "insert"){
			pdb.post(update.data).then(function (response) {
			  // handle response
				var item = view.getItem(update.data["id"]);
				item._id = response.id;
				item._rev = response.rev;
				view.updateItem(update.data["id"],item);
				view.refresh();
				webix.dp(view).reset();
                webix.message("Task created!");
			}).catch(function (err) {
			  console.log(err);
			});
		}
	}
};


//Use your own database - this is a test database
var remoteCouch = "https://dragosstoica.cloudant.com/ukanban";//"http://dragosstoica.iriscouch.com/todo";

//Helper function for database sync
//Synchronization between local PouchDB and remote CouchDB
function syncDB(){
    var sync = pdb.sync(remoteCouch, {
	  retry: true
	}).on('change', function (info) {
	  // handle change
		console.log(info);
	}).on('paused', function () {
	  // replication paused (e.g. user went offline)
		console.log("paused");
	}).on('active', function () {
	  // replicate resumed (e.g. user went back online)
		console.log("active");
	}).on('denied', function (info) {
	  // a document failed to replicate, e.g. due to permissions
		console.log(info);
	}).on('complete', function (info) {
	  // handle complete
		console.log(info);
	}).on('error', function (err) {
	  // handle error
		console.log(err);
		//cancel replication (test if it works?!?)
		sync.cancel();
	});	
	
}


function alertDismissed(){
    return;
}

