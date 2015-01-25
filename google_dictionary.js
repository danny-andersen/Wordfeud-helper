
private function onTestResult(e) {
    var result = GoogleDictionaryResult(e.data);
    alert("Got result: " + result);
}

private function onError(e) {
    trace(e.data);
}

private function onApiError(e) {
    trace(e.responseStatus);
}
        
function lookupWordHandler() {
    var dictionary = new GoogleDictionary();
 	
    dictionary.search("monkey", LanguageCodes.ENGLISH, LanguageCodes.ENGLISH);
    dictionary.addEventListener(GoogleAPIEvent.DICTIONARY_RESULT, onDictionaryResult);
    dictionary.addEventListener(GoogleAPIEvent.ON_ERROR, onError);
    dictionary.addEventListener(GoogleAPIErrorEvent.API_ERROR, onAPIError);
	
}


onload = function() {
	var button = document.getElementById("lookupButton");
	button.onclick = lookupWordHandler;
}