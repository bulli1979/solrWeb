var solrForm = {}
solrForm.rows = null;
solrForm.index = 0; //initial Index
solrForm.numFound = 0;
solrForm.send = function(){
    solrForm.index = 0;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            $("#result").html(solrForm.resultHandler(this.responseText));
       }
    };
    xhttp.open("GET", "http://86.119.37.124:8983/solr/disney/select?q="+solrForm.createQuery(), true);
    xhttp.send(); 
};

solrForm.nextOrPrevious = function(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            $("#result").html(solrForm.resultHandler(this.responseText));
       }
    };
    xhttp.open("GET", "http://86.119.37.124:8983/solr/disney/select?q="+solrForm.createQuery(), true);
    xhttp.send(); 
};

solrForm.createQuery = function(){
    var language = $("#language").val();
    var review = $("#review").val();
    var stars = $("#stars").val();
    var from = $("#from").val();
    var to = $("#to").val();
    var what = $("#what").val();
    var rows = $("#rows").val();
    solrForm.rows = rows;
    query = "";
    if(language != ""){
        query += "language:" + language;
    }
    if(review != ""){
        query = solrForm.chkQuery(query);
        switch(what){
            case "inlcudesOneWords" : 
                query += solrForm.createWords(review," OR ");
                break;
            case "inlcudesAllWords" : 
                query += solrForm.createWords(review," AND ");
                break;
            case "startsWith" : 
            query += "(reviewDE:" + review.split(" ")[0] + "* OR reviewFR:" + review.split(" ")[0] + "* OR reviewIT:" + review.split(" ")[0] + "*  OR reviewESP:" + review.split(" ")[0] + "* OR reviewEN:" + review.split(" ")[0] + "*";
                break;
            case "endsWith" : 
                query += "(reviewDE:*" + review.split(" ")[0] + " OR reviewFR:*" + review.split(" ")[0]+ " OR reviewIT:*" + review.split(" ")[0] + " OR reviewESP:*" + review.split(" ")[0] + " OR reviewEN:*" + review.split(" ")[0];
                break;
        }
    }
    if(stars != ""){
        query = solrForm.chkQuery(query);
        query += "stars:" + stars
    }
    if(from!="" && to != ""){
        query = solrForm.chkQuery(query);
        var f = new Date(from);
        var t = new Date(to);
        query += "date:[" + from + "T00:00:00Z" + " TO " + to + "T00:00:00Z" + "]";
    }

    query = (query!=""? query : "*:*");
    query += "&rows="+rows;
    query += "&start="+solrForm.index;
    return query;
};
solrForm.createWords = function(review,operation){
    var split =review.split(" ");
    var subQuery = "";
    for(var i=0;i<split.length;i++){
        if(i>0){
            subQuery += operation;
        }
        subQuery += "(reviewDE:" + split[i] + " OR reviewFR:" + split[i] + " OR reviewIT:" + split[i] + " OR reviewESP:" + split[i] + " OR reviewEN:" + split[i] + ")";
    }
    return subQuery;
};

solrForm.chkQuery = function(query){
    return query.length > 0 ? query+=" AND ":query;
};
solrForm.resultHandler = function(response){
    var result = "";
    response = JSON.parse(response);
    var entries = response.response.docs;
    $("#head").html(solrForm.extractHead(response));
    for(var i = 0;i<entries.length;i++){
        result += solrForm.addLine(entries[i]);
    }
    return result;
};
solrForm.extractHead = function(response){
    solrForm.numFound = response.response.numFound;
    var head = '<ul class="pagination">';
    if(solrForm.numFound > parseInt(solrForm.rows)){
        head += '<li class="page-item' + (solrForm.index > 0?'':' disabled') +'">';
        head += '<span class="page-link" onclick="solrForm.previous();">zurück</span></li>';
    }
    head += '<li class="page-item active"><span class="page-link">Ergebnisse ' + (solrForm.index + 1) + " bis " + (solrForm.index + parseInt(solrForm.rows)) + " von " + solrForm.numFound + 'Ergebnisse </span></li>';
    if(solrForm.numFound > parseInt(solrForm.rows)){
        head += '<li class="page-item' + (solrForm.index + parseInt(solrForm.rows) >= solrForm.numFound?' disabled':'') + '">';
        head += '<span class="page-link" onclick="solrForm.next();">weiter</span></li>';
    }
    head += '</ul>';
    return head;
};

solrForm.previous = function(){
    if(solrForm.index>0){
        solrForm.index = solrForm.index - parseInt(solrForm.rows);
        solrForm.nextOrPrevious();
    }else{
        return false;
    }
}
solrForm.next = function(){
    if(solrForm.index + parseInt(solrForm.rows) < solrForm.numFound){
        solrForm.index = solrForm.index + parseInt(solrForm.rows);
        solrForm.nextOrPrevious();
    }else{
        return false;
    }
}


solrForm.addLine = function(entry){
    var result = "<div class=\"card\">";
    result += "<div class=\"card-header\">";
    result += solrForm.extractDate(entry.date) + " - " + entry.language + " - " + entry.stars + " Sterne";
    result += "</div>";
    result += "<div class=\"card-body\">";
    result += "<p class=\"card-text\">";
    if(entry.reviewDE){
        result += entry.reviewDE;
    }
    if(entry.reviewFR){
        result += entry.reviewFR;
    }
    if(entry.reviewIT){
        result += entry.reviewIT;
    }
    if(entry.reviewESP){
        result += entry.reviewESP;
    }
    if(entry.reviewEN){
        result += entry.reviewEN;
    }
    result += "</p>";
    result += "</div>";
    result += "</div>";
    return result;
};
solrForm.extractDate = function(dateString){
    var d1 = dateString.split("T")[0];
    var dSplit = d1.split("-");
    return dSplit[2] + "." + dSplit[1] + "." + dSplit[0];

}