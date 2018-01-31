//Webix Proxy for PouchDB
//pdb is the global variable pointing to PouchDb database
webix.proxy.proxyPouchDB = {
    $proxy:true,

    load:function(view, callback){
        //Build JSON Array from database
        console.log(this.source);
        
        pdb.query('tag', {
            key: this.source,
            include_docs: true
        }).then(function (result) {
          // handle result
          var todo_data = [];
          todo_data = result.rows.reduce(function(acc, crt){
              acc.push(crt.doc);
              return acc;
          }, []);
          view.parse(todo_data, 'json');
        }).catch(function (err) {
          console.log(err);
        });
        
        /*
    	pdb.allDocs({
		  include_docs: true
		}).then(function (result) {
		  // handle result
			console.log(result);
			var todo_data = [];
			result.rows.forEach(function(element, index, array){
				todo_data.push(element.doc);
			});
			view.parse(todo_data, 'json');
		}).catch(function (err) {
			//something really bad happened 
		  console.log(err);
		});
        */
    },
    
    
    save:function(view, update, dp, callback){

        //your saving pattern
        if(update.operation == "update"){
			//already having an _id
			pdb.put(update.data).then(function (response) {
			  // handle response
				var item = view.getItem(update.data["id"]);
				item._rev = response.rev;
				view.updateItem(update.data["id"],item);
				view.refresh();	
				webix.dp(view).reset();
			}).catch(function (err) {
			  console.log(err);
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
			}).catch(function (err) {
			  console.log(err);
			});
		}
	}


};
