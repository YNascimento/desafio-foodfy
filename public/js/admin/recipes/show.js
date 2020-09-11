const imageGallery = {
    highlight: document.querySelector('.presentation-box .highlight > img'),
    previews: document.querySelectorAll('.gallery-preview img'),
    setImage(e){
        const {target} = e
        
        //tira active de todas as imgs, coloca na clicada e muda src da highlight pelo src da img clicada
        imageGallery.previews.forEach(preview => preview.classList.remove('active'))
        target.classList.add('active')
        imageGallery.highlight.src = target.src
    }
}