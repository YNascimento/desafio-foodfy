/* Cria e deleta inputs para ingredientes e preparação nas receitas */

let ingredients = document.getElementById('ingredients')
let preparations = document.getElementById('preparations')

function addInput(inputBox, inputField) {
    let newField

    if(inputField.length > 0){
        newField = inputField[inputField.length - 1].cloneNode(true);
    }
    else{
        newField = document.createElement('div')
        newField.setAttribute('id', "ingredient-0")
        newField.setAttribute('class', "ingredient")

        const inputEl = document.createElement('input')
        inputEl.setAttribute('type','text')
        inputEl.setAttribute('name','ingredients[]')
        inputEl.setAttribute('value','')

        const spanEl = document.createElement('span')
        spanEl.setAttribute('class', 'closeBtn')

        const iEl = document.createElement('i')
        iEl.setAttribute('class', 'fas fa-times')

        spanEl.appendChild(iEl)
        newField.appendChild(inputEl)
        newField.appendChild(spanEl)
    }
        
    // Não adiciona um novo input se o último tem um valor vazio
    if (inputField.length > 0 && newField.children[0].value == "") return false;

    // Deixa o valor do input vazio
    newField.children[0].value = "";
    newField.setAttribute('id','ingredient-'+inputField.length)
    
    inputBox.appendChild(newField);
}

function deleteInput(e){
    // e.target was the clicked element
    if (e.target && (e.target.tagName == "i" || e.target.tagName == "I" ) ){
        const targetField = e.target.parentElement.parentElement
        targetField.remove()
	
    }
}
document.querySelector("#addIngredient").addEventListener("click", function(){
    const inputBox = document.querySelector("#ingredients");
    const inputField = document.querySelectorAll(".ingredient");

    addInput(inputBox, inputField)
})
  
document.querySelector("#addPreparation").addEventListener("click", function(){
    const inputBox = document.querySelector("#preparations");
    const inputField = document.querySelectorAll(".preparation");

    addInput(inputBox, inputField)
})

preparations.addEventListener("click", function(e){
    deleteInput(e)
})

ingredients.addEventListener("click",function(e){
    deleteInput(e)
})

/* Recebe, deleta e controla a quantidade de fotos no front end de receitas */
const photosUpload = {
    preview: document.querySelector("#photo-preview"),
    uploadLimit: 5,
    files: [],
    input: "",
    handleInput(event){
        const {files: fileList} = event.target
        photosUpload.input = event.target

        if(photosUpload.hasLimit(event)) return

        Array.from(fileList).forEach(file => {

            photosUpload.files.push(file)
            const reader = new FileReader()

            reader.onload = () => {
                const image = new Image() // <img />
                image.src = String(reader.result)

                const div = photosUpload.getContainer(image)
                photosUpload.preview.appendChild(div)
            }

            reader.readAsDataURL(file) //o fato de ler como URL possibilida usar como src de uma img dps
        })

        photosUpload.input.files = photosUpload.getAllFiles()
    },
    hasLimit(){
        const {input, uploadLimit, preview} = photosUpload
        const {files: fileList} = input

        if(fileList.length > uploadLimit){
            alert(`Envie no máximo ${uploadLimit} fotos`)
            event.preventDefault()
            return true
        }

        const photoDiv = []
        preview.childNodes.forEach(item => {
            if(item.classList && item.classList.value =="photo")
                photoDiv.push(item)
        })

        const totalPhotos = fileList.length + photoDiv.length
        if(totalPhotos > uploadLimit){
            alert('Limite de Fotos Atingido')
            event.preventDefault
            return true
        }

        return false

    },
    getAllFiles(){
        const dataTransfer = new ClipboardEvent("").clipboardData || new DataTransfer()

        photosUpload.files.forEach(file => dataTransfer.items.add(file))
        return dataTransfer.files
    },
    getContainer(image){
        const div = document.createElement('div')
        div.classList.add('photo')
        div.onclick =photosUpload.removePhoto
        div.appendChild(image)
        div.appendChild(photosUpload.getRemoveBtn())

        return div
    },
    getRemoveBtn(){
        const btn = document.createElement('i')
        btn.classList.add('material-icons')
        btn.innerHTML=('close')
        return btn
    },
    removePhoto(event){
        const photoDiv = event.target.parentNode
        const photosArray = Array.from(photosUpload.preview.children)
        const index = photosArray.indexOf(photoDiv) //gets index of the img clicked from the preview childen array

        photosUpload.files.splice(index,1)
        photosUpload.input.files = photosUpload.getAllFiles()

        photoDiv.remove()
    },
    removeOldPhoto(event){
        const photoDiv = event.target.parentNode

        if(photoDiv.id){
            const removedFiles = document.querySelector('input[name="removed_files"]')
            if(removedFiles){
                removedFiles.value += `${photoDiv.id},`
            }
        }

        photoDiv.remove()
    }
}