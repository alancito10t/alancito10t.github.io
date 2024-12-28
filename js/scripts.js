// 1. Product Information Display
document.addEventListener('DOMContentLoaded', () => {
    // Handle "More Info" clicks
    const moreInfoLinks = document.querySelectorAll('.more-info-link');
    moreInfoLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const description = link.nextElementSibling;
            if (description.classList.contains('hidden')) {
                description.classList.remove('hidden');
                link.textContent = '(-) Ver menos';
            } else {
                description.classList.add('hidden');
                link.textContent = '(+) Ver más';
            }
        });
    });

    // 2. Shopping Cart Implementation
    let cart = JSON.parse(localStorage.getItem('cart')) || {};

    // Function to generate consistent product IDs for static products
    function generateStaticProductId(name, price) {
        // Create a unique identifier based on product name and price
        return `static-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${price}`;
    }

    // Create floating cart element
    const floatingCart = document.createElement('div');
    floatingCart.className = 'floating-cart';
    floatingCart.innerHTML = `
        <div class="cart-header">
            <h3>Carrito de Compras</h3>
            <span class="close-cart">&times;</span>
        </div>
        <div class="cart-items"></div>
        <div class="cart-footer">
            <div class="cart-total">Total: £0</div>
            <button class="checkout-btn">Finalizar Compra</button>
        </div>
    `;
    document.body.appendChild(floatingCart);

    // Add cart icon
    const cartIcon = document.createElement('div');
    cartIcon.className = 'cart-icon';
    cartIcon.innerHTML = '🛒 <span class="cart-count">0</span>';
    document.body.appendChild(cartIcon);

    // Add overlay
    const overlay = document.createElement('div');
    overlay.className = 'cart-overlay';
    document.body.appendChild(overlay);

    // Cart visibility handlers
    cartIcon.addEventListener('click', () => {
        floatingCart.classList.toggle('show');
        overlay.classList.toggle('show');
    });

    document.querySelector('.close-cart').addEventListener('click', () => {
        floatingCart.classList.remove('show');
        overlay.classList.remove('show');
    });

    overlay.addEventListener('click', () => {
        floatingCart.classList.remove('show');
        overlay.classList.remove('show');
    });

    // Initialize static products
    function initializeStaticProducts() {
        const staticProducts = document.querySelectorAll('#productos .producto-card');
        staticProducts.forEach(productCard => {
            const name = productCard.querySelector('h3').textContent;
            const price = parseFloat(productCard.querySelector('.precio').textContent.replace('£', ''));
            const productId = generateStaticProductId(name, price);
            productCard.dataset.id = productId;

            // Update button state if product is in cart
            const button = productCard.querySelector('button');
            if (cart[productId]) {
                button.textContent = `Añadido (${cart[productId].quantity})`;
                button.classList.add('added');
            }

            button.addEventListener('click', () => {
                const img = productCard.querySelector('img').src;
                
                if (!cart[productId]) {
                    cart[productId] = {
                        name,
                        price,
                        img,
                        quantity: 1
                    };
                    button.classList.add('added');
                } else {
                    cart[productId].quantity++;
                }
                
                button.textContent = `Añadido (${cart[productId].quantity})`;
                updateCart();
                saveCart();
            });
        });
    }

    function updateCart() {
        const cartItems = document.querySelector('.cart-items');
        cartItems.innerHTML = '';
        let total = 0;
        let itemCount = 0;

        Object.entries(cart).forEach(([id, product]) => {
            itemCount += product.quantity;
            total += product.price * product.quantity;

            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${product.img}" alt="${product.name}">
                <div class="item-details">
                    <h4>${product.name}</h4>
                    <div class="item-price">£${product.price}</div>
                    <div class="item-quantity">
                        <button class="quantity-btn minus">-</button>
                        <span>${product.quantity}</span>
                        <button class="quantity-btn plus">+</button>
                        <button class="remove-btn">🗑️</button>
                    </div>
                </div>
            `;

            // Quantity buttons functionality
            itemElement.querySelector('.minus').addEventListener('click', () => {
                if (cart[id].quantity > 1) {
                    cart[id].quantity--;
                    updateProductButton(id);
                    updateCart();
                    saveCart();
                }
            });

            itemElement.querySelector('.plus').addEventListener('click', () => {
                cart[id].quantity++;
                updateProductButton(id);
                updateCart();
                saveCart();
            });

            itemElement.querySelector('.remove-btn').addEventListener('click', () => {
                delete cart[id];
                updateProductButton(id, true);
                updateCart();
                saveCart();
            });

            cartItems.appendChild(itemElement);
        });

        document.querySelector('.cart-total').textContent = `Total: £${total.toFixed(2)}`;
        document.querySelector('.cart-count').textContent = itemCount;
    }

    function updateProductButton(productId, removed = false) {
        const productCard = document.querySelector(`[data-id="${productId}"]`);
        if (productCard) {
            const button = productCard.querySelector('button');
            if (removed) {
                button.textContent = 'Comprar';
                button.classList.remove('added');
            } else {
                button.textContent = `Añadido (${cart[productId].quantity})`;
            }
        }
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Initialize cart state
    initializeStaticProducts();
    updateCart();

    // 3. Fetch and display modern products
    async function fetchModernProducts() {
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            const products = await response.json();
            
            const modernProductsSection = document.getElementById('nuevosproductos');
            const productsContainer = document.createElement('div');
            productsContainer.className = 'container-productos';

            products.forEach(product => {
                const productId = `modern-${product.id}`;
                const productCard = document.createElement('article');
                productCard.className = 'producto-card';
                productCard.dataset.id = productId;
                
                productCard.innerHTML = `
                    <img src="${product.image}" alt="${product.title}">
                    <h3>${product.title.length > 30 ? product.title.substring(0, 30) + '...' : product.title}</h3>
                    <a href="#" class="more-info-link">(+) Ver más</a>
                    <p class="product-description hidden">${product.description}</p>
                    <span class="precio">£${parseFloat(product.price).toFixed(2)}</span>
                    <button>${cart[productId] ? `Añadido (${cart[productId].quantity})` : 'Comprar'}</button>
                `;

                if (cart[productId]) {
                    productCard.querySelector('button').classList.add('added');
                }

                productsContainer.appendChild(productCard);
            });

            modernProductsSection.appendChild(productsContainer);
            initializeNewProductEventListeners(productsContainer);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    function initializeNewProductEventListeners(container) {
        // Add More Info functionality
        container.querySelectorAll('.more-info-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const description = link.nextElementSibling;
                if (description.classList.contains('hidden')) {
                    description.classList.remove('hidden');
                    link.textContent = '(-) Ver menos';
                } else {
                    description.classList.add('hidden');
                    link.textContent = '(+) Ver más';
                }
            });
        });

        // Add Cart functionality
        container.querySelectorAll('.producto-card button').forEach(button => {
            const productCard = button.closest('.producto-card');
            const productId = productCard.dataset.id;

            button.addEventListener('click', () => {
                const name = productCard.querySelector('h3').textContent;
                const price = parseFloat(productCard.querySelector('.precio').textContent.replace('£', ''));
                const img = productCard.querySelector('img').src;

                if (!cart[productId]) {
                    cart[productId] = {
                        name,
                        price,
                        img,
                        quantity: 1
                    };
                    button.classList.add('added');
                } else {
                    cart[productId].quantity++;
                }

                button.textContent = `Añadido (${cart[productId].quantity})`;
                updateCart();
                saveCart();
            });
        });
    }

    // Fetch modern products when the page loads
    fetchModernProducts();
});