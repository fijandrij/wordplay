red_cekanja = new Meteor.Collection('red_cekanja');

zapocni_igru = new Meteor.Collection('zapocni_igru');

duplici = new Meteor.Collection('duplici');

ostalo_rijeci = new Meteor.Collection('preostalo');//dodano by jengic

var bazaRijeci = {"BAKA" : 2, 
                  "KARTA": 5,
                  "RAK" : 2, 
                  "RATAR": 5,
                  "BRAK" : 2, 
                  "BRAT": 5,
                  "ROTKVA" : 2, 
                  "KVAR": 5,
                  "VAR" : 2, 
                  "TOR": 5,
                  "ROMB" : 2, 
                  "MRAV": 5,
                  "MRAK" : 2, 
                  "MOTKA": 5,
                  "MAT" : 2, 
                  "MATA": 5,
                  "MATO" : 2, 
                  "VATRA": 5,
                  "VRAT" : 2, 
                  "KAT": 5,
                  "VRAG" : 2, 
                  "TATA": 5,
                  "MIR" : 2, 
                  "RIM": 5,
                  "RAT": 5,
                  "GRM": 5,
                  "TAKVI": 5,
                  "KRV": 5,
                  "KRIV": 5};

var posjeceni = new Array();
var ukupno = 0;

var word_id = ''; //id od rijeci koje su preostale
var naso = null;
nadene = new Meteor.Collection('nadene');

var flag = false;
//dodano by jengic

var zastavica = true;
var nova_rijec = '';
if (Meteor.isClient) {
  
  Deps.autorun(function(){

    Session.set('zastavica', zastavica); //valjda mora tu ic tako da bi ga uopce mogao trgiggerat, 
    //jer se autorun pokrecen samo na session i jos neke metode
    Handlebars.registerHelper('show_content',function(input){
   
      if(zapocni_igru.find().count() > 0){
        return false;
      } 
      else{
        return true;
      } 

    });

  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  }); //konfiguriramo polja koja je potrebno unjest prilikom prijave

  getUsername = function(){
    var id = Meteor.userId();
      //Meteor.subscribe('user-info', id);
      Deps.autorun(function(){
        var user = Meteor.users.findOne(id);
        if(user){
          Session.set('korisnik', user.username);
        }else{
          Session.set('korisnik', '');
        }
      });
  }

  Template.hello.helpers({

    "user" : function(){
      getUsername();
      return Session.get('korisnik');
    }
  });

  Template.hello.events({
    
    'click #dodaj_u_red_cekanja' : function(){
      nova_rijec = Session.get('korisnik') + ':';
      red_cekanja.insert({
        username: Session.get('korisnik')
        }); //dodavanje samog sebe u queue
    }
  });

   Template.players.helpers({
      'igraci' : function(){
        var id = Meteor.userId();
        return red_cekanja.find();
      }
    });

   Template.startgame.helpers({
    'start': function(){
      if(red_cekanja.find().count() > 1){
        return true;
      }else{ 
        return false;
      }
    }
   });

   Template.startgame.events({
    'click #zapocni_igru': function(){
        zapocni_igru.insert({zastavica: true});
        zastavica = false;
        Session.set('zastavica', zastavica);
    }
  });

   //dodano by jengic #####################################################################

   Template.uprav.events = {
  'click' : function(){
        document.getElementById("nadene").innerHTML += document.getElementById("rez").innerHTML + "<br/>";
        
        //dodao by jandra
        naso = document.getElementById("rez").innerHTML;
        
        //dodao by jandra
        document.getElementById("rez").innerHTML = "";
        resetTable();
        }
  }
  
  Template.tablica.events = {
  'click' : function(){
        var tbl = document.getElementById("table");
              if (tbl != null) {
       
                for (var i = 0; i < tbl.rows.length; i++) {
                    for (var j = 0; j < tbl.rows[i].cells.length; j++)
                        tbl.rows[i].cells[j].onclick = function (){ getval(this); };
              
                }

            }
      }
  }
  
  function resetTable(){
  //alert("resetiram tablu");
    var tbl = document.getElementById("table");
    if (tbl != null) {
            for (var i = 0; i < tbl.rows.length; i++) {
                for (var j = 0; j < tbl.rows[i].cells.length; j++)
                    tbl.rows[i].cells[j].style.color = "black" ;
            }

        }
    
    }
   



    //dodano by jandra

    Template.words_to_find.helpers({
      'to_find': function(){
        return ostalo_rijeci.findOne({}).to_find;
      }
    });

    Template.nadene_rijeci.helpers({
      'words_array': function(){
        return nadene.find({}, {sort: {points: -1}});
      }
    });

    function isPogodena(ri){
      if(duplici.findOne({duplic: ri}) === undefined)
        return false
      return true;
      
    }
    
    //dodano by jandra
  var user_id = '';
  
  function spremi(){
    var ri = document.getElementById("word").value.toUpperCase();
    //nadene.insert(ri);
    if (ri.length > 0){
      if ( bazaRijeci[ri] != undefined && isPogodena(ri) === false) 
      {
        //rijec je nadena i treba dodjelit bodove
        //document.getElementById("nadene").innerHTML +=  ri + "&nbsp;&nbsp;";
        ukupno += ri.length;
        if(flag === false){
          nova_rijec += ' ' + ri;
          nadene.insert({username: Session.get('korisnik'), words: nova_rijec, points: ukupno});
          duplici.insert({duplic: ri}); //puni kolekciju sa pogodenim rijecima
          flag = true;
          user_id = nadene.findOne({username: Session.get('korisnik')})._id; //treba mi id dodanog zbog updatea

          //dodavanje brojaca
          
          word_id = ostalo_rijeci.findOne()._id;
          ostalo_rijeci.update({_id: word_id}, {$set: {to_find: ostalo_rijeci.findOne().to_find - 1}});
          
          //
        }else{
          //radi update nad tom kolekcijomfaces
          nova_rijec += ' ' + ri;
          duplici.insert({duplic: ri}); //puni kolekciju sa pogodenim rijecima
          nadene.update({_id: user_id}, {$set: {words: nova_rijec, points: ukupno}});

          //update rijeci
          ostalo_rijeci.update({_id: word_id}, {$set: {to_find: ostalo_rijeci.findOne().to_find - 1}});
          //
        }
        

      }else
      {
        //rijec nije nadena
        //document.getElementById("nadene").innerHTML +=  "<s>"+  ri + "</s>&nbsp;&nbsp;";

        if(flag === false){
          nova_rijec += ' ' + '<s>' + ri + '</s>';
          nadene.insert({username: Session.get('korisnik'), words: nova_rijec});
          flag = true;
          user_id = nadene.findOne({username: Session.get('korisnik')})._id; //treba mi id dodanog zbog updatea
        }else{
          //radi update nad tom kolekcijomfaces
          nova_rijec += ' ' + '<s>' + ri + '</s>';
          nadene.update({_id: user_id}, {$set: {words: nova_rijec}});
        }

      }
      document.getElementById("rez").innerHTML = "";
      document.getElementById("word").value = "";
      resetTable();
    }
  }
  
    
  Template.form.events = {
      'keyup #word' : function(event){

        if (event.which == 8){
          document.getElementById("rez").innerHTML = document.getElementById("word").value.toUpperCase();
        mark_table();
          if (0 == document.getElementById("word").value.length) 
            resetTable();
       }else if (event.which == 13){
        spremi();
       }else{
          var slovo = String.fromCharCode(event.which).toUpperCase();
        document.getElementById("rez").innerHTML += slovo;  
        mark_table(table);
       }
     
    }
    } 
  
  function mark_cell(i,j,color){
    var tbl = document.getElementById("table");
    if (tbl != null) {
      tbl.rows[i].cells[j].style.color = color;
    }
  }

  
  function mark_table(){
  
    resetTable();
    
    var tbl = document.getElementById("table");
    var rijec = document.getElementById("word").value.toUpperCase();    
    
    if (tbl != null) 
    {
      for (var i = 0; i < tbl.rows.length; i++) 
      {
        for (var j = 0; j < tbl.rows[i].cells.length; j++)
        { 
        posjeceni = new Array();
        dfs(rijec,i,j);       
        }
      }     
    } 
  }//kraj mark slovo
  
  //funckija za prolazenje rijeci u matrici i oznacavanje (koristi mark_cell)
  function dfs(rijec, x, y){
  
    var tbl = document.getElementById("table");
    //alert(x + " " + tbl.rows.length+ " " + y + " " + tbl.rows[0].cells.length);
    if (x<0 || y<0 || x >= tbl.rows.length || y >= tbl.rows[0].cells.length) return 0;
    
    if (rijec.length == 0) 
      return 1;
    else
    {
      
      if (tbl.rows[x].cells[y].firstChild.data == rijec[0])
      {
        
        //mark_cell(x,y,"red");
        posjeceni.push( x.toString()+y.toString() );
        var ret = 0;
        
        var radna = rijec.slice(1,rijec.length);
        //alert (rijec + " " + x + " " + y + " radna: " + radna);
      
        if ( provjeri_posjetu(radna,x-1,y) == false ) //ovo je za gore
        {
          ret |= dfs(radna, x-1, y ); 
          if (ret==1)
          {   
            mark_cell(x,y,"red");
            posjeceni.push( (x-1).toString()+y.toString() ) ;         
          }
        }
        if ( provjeri_posjetu(x+1,y) == false ) //ovo je za dole
        {
          ret |= dfs(radna, x+1, y ); 
          if (ret==1)
          {
            mark_cell(x,y,"red");
            posjeceni.push( (x+1).toString()+y.toString() ) ;         
          }
        }
        if ( provjeri_posjetu(x,y-1) == false ) //ovo je ljevo
        {
          ret |= dfs(radna, x, y-1 ); 
          if (ret==1)
          {
            mark_cell(x,y,"red");
            posjeceni.push( x.toString()+(y-1).toString() ) ;         
          }
        }
        if ( provjeri_posjetu(x,y+1) == false ) //ovo je desno
        {
          ret |= dfs(radna, x, y+1 ); 
          if (ret==1)
          {
            mark_cell(x,y,"red");
            posjeceni.push( x.toString()+(y+1).toString() ) ;         
          }
        }
        //sad tu malo krecu dijagonale
        if ( provjeri_posjetu(x+1,y+1) == false ) //ovo je desno-dole
        {
          ret |= dfs(radna, x+1, y+1 ); 
          if (ret==1)
          {
            mark_cell(x,y,"red");
            posjeceni.push( (x+1).toString()+(y+1).toString() ) ;         
          }
        }
        if ( provjeri_posjetu(x-1,y+1) == false ) //ovo je desno-gore
        {
          ret |= dfs(radna, x-1, y+1 ); 
          if (ret==1)
          {
            mark_cell(x,y,"red");
            posjeceni.push( (x-1).toString()+(y+1).toString() ) ;         
          }
        }
        if ( provjeri_posjetu(x+1,y-1) == false ) //ovo je ljevo-gore
        {
          ret |= dfs(radna, x+1, y-1 ); 
          if (ret==1)
          {
            mark_cell(x,y,"red");
            posjeceni.push( (x+1).toString()+(y-1).toString() ) ;         
          }
        }
        if ( provjeri_posjetu(x-1,y-1) == false ) //ovo je desno-gore
        {
          ret |= dfs(radna, x-1, y-1 ); 
          if (ret==1)
          {
            mark_cell(x,y,"red");
            posjeceni.push( (x-1).toString()+(y-1).toString() ) ;         
          }
        }
        return ret;
        
      }else
        {
          return 0;
        }
    }
  
  }
  
  function provjeri_posjetu(x,y){
    for (var i=0; i<posjeceni.length; i++)
      if ( posjeceni[i] == x.toString() + y.toString() ) 
        return true;
    
    return false;
  }

   //dodano by jengic #####################################################################

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    
    red_cekanja.remove({});
    zapocni_igru.remove({});
    nadene.remove({});
    duplici.remove({});
    ostalo_rijeci.remove({});
    ostalo_rijeci.insert({to_find: 29});
    // code to run on server at startup
  });

  
}
