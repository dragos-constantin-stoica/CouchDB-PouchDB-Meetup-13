//pdb is the global variable pointing to PouchDb database
var pdb;


//Webix Proxy for PouchDB
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
              crt.doc.rev = crt.doc._rev;
              acc.push(crt.doc);
              return acc;
          }, []);
          view.parse(todo_data, 'json');
        }).catch(function (err) {
          console.log(err);
        });
    },
        
    save:function(view, update, dp, callback){        
        //bind view to context to access it from callback
        var processResponse = (function(response){
            if (update.operation == "update"){
                var item = view.getItem(update.data["id"]);
    			item._rev = response.rev;
				view.updateItem(update.data["id"],item);
				view.refresh();	
				webix.dp(view).reset();  
                webix.message("Task updated");
            }
            
            if(update.operation == "insert"){
    			var item = view.getItem(update.data["id"]);
				item._id = response.id;
				item.rev = response.rev;
				view.updateItem(update.data["id"],item);
				view.refresh();
				webix.dp(view).reset();
                webix.message("Task created!");                
            }
        })(view);
        
        //your saving pattern
        if(update.operation == "update"){
			//already having an _id, put the _rev
            update.data._rev = update.data.rev;
			pdb.put(update.data,
                function (err, response) {
                    if(err) {return console.log(err);}
			        // handle response
                    processResponse(response);                    
			    }
            );
		}

		if(update.operation == "insert"){
			pdb.post(update.data, 
                function (err, response) {
                    if(err) {return console.log(err);}
    		        // handle response
                    processResponse(response);                    
			    }
            );
		}
	}
};


//Use your own database - this is a test database
var remoteCouch = "https://dragosstoica.cloudant.com/ukanban";//"http://dragosstoica.iriscouch.com/todo";

//Helper function for database sync
//Synchronization between local PouchDB and remote CouchDB
function syncDB(){
    
    navigator.notification.alert(
        'Syncronisation started!',  // message
        function(){return;},         // callback
        'PouchDB message',            // title
        'OK'                  // buttonName
    );  
    
    
    var sync = pdb.sync(remoteCouch, {
	  retry: false
	}).on('change', function (info) {
	  // handle change
		console.log(info);
	}).on('paused', function () {
	  // replication paused (e.g. user went offline)
		console.log("paused");
        /*
        navigator.notification.alert(
            'Syncronisation paused!',  // message
            function(){return;},         // callback
            'PouchDB message',            // title
            'OK'                  // buttonName
        );
        */
	}).on('active', function () {
	  // replicate resumed (e.g. user went back online)
		console.log("active");
	}).on('denied', function (info) {
	  // a document failed to replicate, e.g. due to permissions
		console.log(info);
	}).on('complete', function (info) {
	  // handle complete
		console.log(info);
        navigator.notification.alert(
            'Syncronisation complete!',  // message
            function(){return;},         // callback
            'PouchDB message',            // title
            'OK'                  // buttonName
        );
	}).on('error', function (err) {
	  // handle error
		console.log(err);
		//cancel replication (test if it works?!?)
        navigator.notification.alert(
            'Syncronisation canceled!',  // message
            function(){return;},         // callback
            'PouchDB message',            // title
            'OK'                  // buttonName
        );    
		sync.cancel();
	});	

}

