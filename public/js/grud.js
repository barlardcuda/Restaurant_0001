document.addEventListener("DOMContentLoaded", () => {
    const mdContent = document.getElementById('md-content')
    const smContent = document.getElementById('sm-content')
    const searchIcon = document.getElementById('search-icon')
    const menuIcon = document.getElementById('menu-icon')
    const menu = document.getElementById('menu')
    const menuOverlay = document.getElementById('menu-overlay')
    const searchModal = document.getElementById('search-modal')
    const searchClose = document.getElementById('search-close')
    const searchInput = document.getElementById('search-input')
    const editModal = document.getElementById('edit-modal')
    const productNameInput = document.getElementById('product-name')
    const productPriceInput = document.getElementById('product-price')
    const deleteButton = document.getElementById('delete-product')
    const saveButton = document.getElementById('save-product')
    const productImgInput = document.getElementById('product-img')
    const previewImg = document.getElementById('preview-img')

    let itemMap = {}
    let editingItemId = null

    menuIcon.addEventListener('click', () => {
        menu.classList.toggle('show')
        menuOverlay.classList.toggle('hidden')
    })

    menuOverlay.addEventListener('click', () => {
        menu.classList.remove('show')
        menuOverlay.classList.add('hidden')
    })

    searchIcon.addEventListener('click', () => {
        searchModal.classList.remove('hidden')
    })

    searchClose.addEventListener('click', () => {
        searchModal.classList.add('hidden')
    })

    let debounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = searchInput.value.toLowerCase()
            filterItems(query)
        }, 300)
    })

    function filterItems(query) {
        document.querySelectorAll('#md-content .w-full').forEach(item => {
            const name = item.querySelector('h2').textContent.toLowerCase()
            item.style.display = name.includes(query) ? 'block' : 'none'
        })
        document.querySelectorAll('#sm-content .w-full').forEach(item => {
            const name = item.querySelector('h2').textContent.toLowerCase()
            item.style.display = name.includes(query) ? 'block' : 'none'
        })
    }

    function fetchData() {
        fetch('/api/getPost')
            .then(res => res.json())
            .then(({ result }) => {
                const generateHTML = (item) => `
                    <div class="w-full rounded-md bg-gray-200 mb-2 transition-transform transition-shadow duration-300 ease-in-out hover:shadow-md hover:scale-105">
                        <div class="img rounded-md w-full h-32 bg-gray-300"></div>
                        <div class="w-full p-2">
                            <h2 class="text-lg">${item.name}</h2>
                            <p class="text-sm font-thin">${item.price.toLocaleString()} ກີບ</p>
                        </div>
                        <button data-id="${item.id}" class="edit-product block w-full bg-yellow-500 p-1 rounded-b-md text-white">ແກ້ໄຂ</button>
                    </div>`

                smContent.innerHTML = result.map(generateHTML).join('')
                mdContent.innerHTML = result.map(generateHTML).join('')

                itemMap = result.reduce((acc, item) => {
                    acc[item.id] = item
                    return acc
                }, {})

                document.querySelectorAll('.edit-product').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const id = e.currentTarget.dataset.id
                        const item = itemMap[id]

                        productNameInput.value = item.name
                        productPriceInput.value = item.price
                        editingItemId = id

                        // Update image preview
                        previewImg.src = item.image || '' // Make sure the image URL is correct

                        editModal.style.display = 'flex'
                    })
                })
            })
    }

    deleteButton.addEventListener('click', () => {
        if (editingItemId) {
            fetch(`/api/delete/${editingItemId}`, { method: 'DELETE' })
                .then(() => {
                    editModal.style.display = 'none'
                    fetchData()
                })
        }
    })

    saveButton.addEventListener('click', () => {
        if (editingItemId) {
            const updatedData = {
                name: productNameInput.value,
                price: Number(productPriceInput.value),
                // You might need to handle the image upload separately
            }

            fetch(`/api/update/${editingItemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            })
                .then(() => {
                    editModal.style.display = 'none'
                    fetchData()
                })
        }
    })

    window.onclick = (event) => {
        if (event.target === editModal) {
            editModal.style.display = 'none'
        }
    }

    // Handle image preview
    productImgInput.addEventListener('change', (event) => {
        const file = event.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = () => {
                previewImg.src = reader.result
            }
            reader.readAsDataURL(file)
        } else {
            previewImg.src = ''
        }
    })

    fetchData()
})
