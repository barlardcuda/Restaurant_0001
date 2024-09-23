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
    const orderItems = document.getElementById('order-items')
    const totalAmount = document.getElementById('total-amount')
    const totalItems = document.getElementById('total-items')
    const cancelOrder = document.getElementById('cancel-order')
    const confirmOrder = document.getElementById('confirm-order')

    let cart = []
    let itemMap = {}

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
        }, 300); // Adjust delay as needed
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

    function checkCart() {
        cart = cart.filter(item => (item.id in itemMap))
        updateOrderSummary()
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
                        <button data-id="${item.id}" data-price="${item.price}" class="add-to-cart block w-full bg-green-500 p-2 rounded-b-md text-white">ເພີ່ມ</button>
                    </div>
                `

                const renderGridContent = (columns) => {
                    const content = Array.from({ length: columns }, () => [])
                    itemMap = {}
                    result.forEach((item, index) => {
                        content[index % columns].push(generateHTML(item))
                        itemMap[item.id] = item.name
                    })
                    return content.map(column => `<div>${column.join('')}</div>`).join('')
                }

                mdContent.innerHTML = renderGridContent(4)
                smContent.innerHTML = renderGridContent(2)

                document.querySelectorAll('.add-to-cart').forEach(button => {
                    button.addEventListener('click', () => {
                        const id = button.getAttribute('data-id')
                        const price = parseInt(button.getAttribute('data-price'), 10)
                        addToCart(id, price)
                    })
                })
            })
            .catch(() => {
                mdContent.innerHTML = '<p class="text-red-500">ບໍ່ສາມາດສະແດງສິ້ນຄ້າໄດ້</p>'
                smContent.innerHTML = '<p class="text-red-500">ບໍ່ສາມາດສະແດງສິ້ນຄ້າໄດ້</p>'
            })
    }
    fetchData()
    // setInterval(() => {
    //     fetchData()
    //     checkCart()
    // }, 5000)

    function addToCart(id, price) {
        const existingItem = cart.find(item => item.id === id)
        if (existingItem) {
            existingItem.quantity += 1
        } else {
            cart.push({ id, price, quantity: 1 })
        }
        updateOrderSummary()
    }

    function updateOrderSummary() {
        orderItems.innerHTML = cart.map(item => `
            <ul class="flex justify-between bg-gray-100 p-2 text-sm rounded-md">
                <p>${itemMap[item.id]}</p>
                <div class="flex items-center">
                    <p class="mr-4">${(item.price * item.quantity).toLocaleString()} ກີບ</p>
                    <input type="number" value="${item.quantity}" min="1" class="w-10 rounded-sm text-center outline-none border" data-id="${item.id}">
                    <button class="delete-item bg-red-500 text-white px-1 rounded-md ml-2" data-id="${item.id}">ລົບ</button>
                </div>
            </ul>
        `).join('')

        const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
        const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0)
        totalAmount.textContent = `${total.toLocaleString()} ກີບ`
        totalItems.textContent = totalQuantity

        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', () => {
                const id = input.getAttribute('data-id')
                const quantity = parseInt(input.value, 10)
                const item = cart.find(item => item.id === id)
                if (item) {
                    item.quantity = quantity
                    updateOrderSummary()
                }
            })
        })

        document.querySelectorAll('.delete-item').forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id')
                cart = cart.filter(item => item.id !== id)
                updateOrderSummary()
            })
        })
    }

    cancelOrder.addEventListener('click', () => {
        cart = []
        updateOrderSummary()
        searchInput.value = ''
        filterItems('')
    })

    confirmOrder.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/order', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cart)
            });
    
            const result = await response.json()
    
            if (response.ok) {
                alert(result.desc)
                cart = []
                updateOrderSummary()
            } else {
                alert(result.desc)
            }
        } catch (error) {
            console.error('Error:', error);
            alert('ມີບັນຫາໃນການສົ່ງຂໍ້ມູນ');
        }
    });
    
    
})