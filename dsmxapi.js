var dsmxapi = {
  //translator
  trans: function(t,numbers,o){
    
    /*
    try{
      console.log(trasnslations.test;);
    }catch(er){console.log("no translation defined");
      var translations;
    }
    if (typeof translations === 'undefined') {
      var translations = {};
    }*/
      
    var out = t;
    
    var transO = o || translations || {};
    if (transO[t] !== undefined){
      out = transO[t]; 
    }
    if(numbers !== undefined){
      for(n in numbers){
        out = out.split("{"+n+"}").join(numbers[n]);
      }
    }
    return out;
  },
  //filter converter
  fStringer: function (f){
    f = f.replace(/\<\|/g,"[{").replace(/\|\>/g,"]}").replace(/\}/g,"]").replace(/\{/g,"[");
    return f;
  },
  //serialized Array to dsmx table
  formArrayToTable: function(a){
    //a = [{name:'x',value:'y'}];
    /*
      {
        "columns" : ["EMail","Firstname","Lastname"],           //The columns thats values should be used for creating new records (EMail,Firstname, Lastname)
        "rows" : [                                              //An array containing all the records that should be created
          ["mathilda.denison@gmail.com","Mathilda","Denison"],  //An array containing the values that should be used for record creation (EMail: mathilda.denison@gmail.com, Firstname: Mathilda, Lastname: Denison)
          ["dennis.wright@gmail.com","Dennis","Wright"],
          ["craigs@gmail.com","Craig","Spencer"]
        ]
      }
    */
    var out = {columns:[],rows:[]};
    var row = [];
    for(var c = 0; c < a.length; c++){
      out.columns.push(a[c].name);
      row.push(a[c].value);
    }
    out.rows.push(row);
    return out;
  },
  filterFromArray:function(a,operator,connector){
    // a = [['dbfield','value'],['dbfield2'],'value2']; -> ((<|dbfield|> operator 'value') connector (<|dbfield2|> operator 'value2'))
    //((<|PL|> Equals 'BO') or (<|PL|> Equals 'MG')) 
    var filterString = '';
    if(a.length === 1){
        filterString = "(<|"+a[0][0]+"|> "+operator+" '"+ a[0][1]+"')";
    }else{
      for(var i = 1; i < a.length; i++){
        if(i===1){
          filterString = "(<|"+a[i][0]+"|> "+operator+" '"+ a[i][1] +"') "+connector+" ";
        }else if(i+1<a.length){
          filterString = "(" + filterString;
          filterString += "(<|"+a[i][0]+"|> "+operator+" '"+ a[i][1] +"')) "+connector+" "
        }else if(i+1 === a.length){
          filterString = "(" + filterString;
          filterString += "(<|"+a[i][0]+"|> "+operator+" '"+ a[i][1] +"'))"
        }
      }
      
    }
    return filterString;
  },
  fromTableToArray: function(table){
    //out = [{name:'x',value:'y'}];
    var out = [];
    var rows = table.rows;
    var columns = table.columns;
    for(var r = 0; r < rows.length; r++){
      var row = {};
      for(var c = 0; c < columns.length; c++){
        row[columns[c]] = rows[r][c]; 
      }
      out.push(row);
    }
    return out;
  },
  add:function(options){
    var defaults = {
      table:{
        "columns": [],
        "rows":[]
      },
      dr: "CampaignDatabase",
      callback: function(responseObject){
        console.log(responseObject);
        alert("Records created, responseOnject: " + responseObject);
      }
    };
    var settings = $.extend(defaults,options);
    var that = this;

    dsmx.api.dataRelations.create(settings.dr, settings.table, function(result){
      that.successCallback(result,function(responseObject){
        settings.callback(responseObject);
      });   
    }, that.failCallback);
  },
  update:function(options){
    var defaults = {
      table:{
        "columns": [],
        "rows":[]
      },
      dr: "CampaignDatabase",
      callback: function(responseObject){
        console.log(responseObject);
        alert("Records updated, responseOnject: " + responseObject);
      }
    };
    var settings = $.extend(defaults,options);
    var that = this;

    dsmx.api.dataRelations.update(settings.dr, settings.table, function(result){
      that.successCallback(result,function(responseObject){
        settings.callback(responseObject);
      });   
    }, that.failCallback);
  },
  get: function(options){
    var defaults = {
      query:{
        "mode" : "data",
        "filter": null,
        "columns": null
      },
      dr: "CampaignDatabase",
      callback: function(responseObject){
        alert("Records loaded: " + responseObject.rows.length);
      }
    };
    var settings = $.extend(defaults,options);
    var that = this;

    dsmx.api.dataRelations.get(settings.dr, settings.query, function(result){
      that.successCallback(result,function(responseObject){
        settings.callback(responseObject);
      });   
    }, that.failCallback);

  },
  failCallback: function() {      
      try{
        openDialog('Unable to update records');
      }catch(er){
        alert('Unable to update records');
      }
  },

  successCallback: function(result,cb) {    
    if(result.state != 0) {
      try{
        openDialog('[' + result.failureDetail + '] ' + result.failureMessage);
      }catch(er){
        alert('[' + result.failureDetail + '] ' + result.failureMessage);
      }
    } else {
      if(cb!== undefined){
        cb(result.responseObject);  
      }           
    }
  }
}