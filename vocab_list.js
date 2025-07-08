async function fetchModules() {
    try {
        let response = await fetch('data/' + 'vocabList.json');
        let json = await response.json();
        console.log("Got vocab Modules = " + json);
        return json;
    } catch (error) {
        console.log('There was an error', error);
    }

    return [];
}


async function loadVocabModules() {
    const modules = await fetchModules();

    const container = document.getElementById("vocabSelector");

    console.log("Modues = " + modules);
    modules.forEach(obj => {
        const card = document.createElement("div");
        card.className = "card text-center p-3";
        card.style.width = "8rem";
        //card.
        //card.onclick = alert(obj.loc);

        card.innerHTML = `
        <i class="bi bi-book" style="font-size: 2rem;"></i>
        <div class="mt-2" onclick = initVocab("${obj.loc}"); ><p class="text-decoration-underline">${obj.title}</p></div>
      `;

        container.appendChild(card);
    });

}

/**
 * When user clicks on a module this code starts the quiz for the module.
 * @param {} module 
 */
async function initVocab(mod_url) {
    //console.log("Got innitVocab: "+ mod_url);
    //loadQuestion(mod_url);
    
    //loadVocab(mod_url).then(data => {
    //    vocabulary = data; reset(); startQuiz();
    //});
    startQuiz(mod_url);
}
