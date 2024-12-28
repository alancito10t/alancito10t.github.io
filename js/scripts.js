document.addEventListener('DOMContentLoaded', () => {
    /*
        FUNCIONALIDAD UNO
        Ver más (descripciones de productos)
    */
    const verMas = document.querySelectorAll('.ver-mas');
    verMas.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const descripcion = link.nextElementSibling;
            if (descripcion.classList.contains('hidden')) {
                descripcion.classList.remove('hidden');
                link.textContent = '(-) Ver menos';
            } else {
                descripcion.classList.add('hidden');
                link.textContent = '(+) Ver más';
            }
        });
    });

    /*
        FUNCIONALIDAD DOS
        Carrito de compras y cantidades
    */
    let carrito = JSON.parse(localStorage.getItem('carrito')) || {};

    // Generar ID para productos estáticos (es decir, no de la API) en base a su nombre
    // (los productos que vienen de la API ya tienen un ID único)
    function generarID(nombre) {
        return `${nombre.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    }

    // Crear elemento carrito floating
    const floatingCarrito = document.createElement('div');
    floatingCarrito.className = 'carrito';
    floatingCarrito.innerHTML = `
        <div class="carrito-header">
            <h3>Carrito</h3>
            <span class="carrito-cerrar">&times;</span>
        </div>
        <div class="carrito-lista"></div>
        <div class="carrito-footer">
            <div class="carrito-total">Total: £0</div>
            <button class="carrito-finalizar-boton">Finalizar Compra</button>
        </div>
    `;
    document.body.appendChild(floatingCarrito);

    // Agregar ícono del carrito
    const carritoIcon = document.createElement('div');
    carritoIcon.className = 'carrito-icon';
    carritoIcon.innerHTML = '🛒 <span class="carrito-nro">0</span>';
    document.body.appendChild(carritoIcon);

    // Agregar fondo oscuro al abrir el carrito
    const fondo = document.createElement('div');
    fondo.className = 'fondo-carrito';
    document.body.appendChild(fondo);

    // Visibilidad del carrito/fondo
    carritoIcon.addEventListener('click', () => {
        floatingCarrito.classList.toggle('show');
        fondo.classList.toggle('show');
    });
    document.querySelector('.carrito-cerrar').addEventListener('click', () => {
        floatingCarrito.classList.remove('show');
        fondo.classList.remove('show');
    });
    fondo.addEventListener('click', () => {
        floatingCarrito.classList.remove('show');
        fondo.classList.remove('show');
    });

    // Inicializar productos "de época" (estáticos, del HTML)
    function inicializarProductosEpoca() {
        const productosEpoca = document.querySelectorAll('#productos .producto-card');
        productosEpoca.forEach(productoCard => {
            const nombre = productoCard.querySelector('h3').textContent;
            const precio = parseFloat(productoCard.querySelector('.precio').textContent.replace('£', ''));
            const IDproducto = generarID(nombre);
            productoCard.dataset.id = IDproducto;

            // Actualizar botón si el producto está en el carrito, según el ID
            const boton = productoCard.querySelector('button');
            if (carrito[IDproducto]) {
                boton.textContent = `Añadido (${carrito[IDproducto].cantidad})`;
                boton.classList.add('agregado');
            }

            boton.addEventListener('click', () => {
                // Extraer imagen del producto
                const img = productoCard.querySelector('img').src;
                
                if (!carrito[IDproducto]) {
                    carrito[IDproducto] = {
                        nombre,
                        precio,
                        img,
                        cantidad: 1
                    };
                    boton.classList.add('agregado'); // Cambiar estilo del botón
                } else {
                    carrito[IDproducto].cantidad++;
                }
                boton.textContent = `Añadido (${carrito[IDproducto].cantidad})`;
                actualizarCarrito();
                guardarCarrito();
            });
        });
    }

    // Función para actualizar el carrito (precio total)
    function actualizarCarrito() {
        const carritoLista = document.querySelector('.carrito-lista');
        carritoLista.innerHTML = '';
        let total = 0;
        let nroProductos = 0;

        Object.entries(carrito).forEach(([id, producto]) => {
            nroProductos += producto.cantidad;
            total += producto.precio * producto.cantidad;

            // Producto en el carrito
            const productoEnCarrito = document.createElement('div');
            productoEnCarrito.className = 'carrito-producto';
            productoEnCarrito.innerHTML = `
                <img src="${producto.img}" alt="${producto.nombre}">
                <div class="carrito-producto-detalles">
                    <h4>${producto.nombre}</h4>
                    <div class="carrito-producto-precio">£${producto.precio}</div>
                    <div class="carrito-producto-cantidad">
                        <button class="carrito-cantidad-boton minus">-</button>
                        <span>${producto.cantidad}</span>
                        <button class="carrito-cantidad-boton plus">+</button>
                        <button class="carrito-eliminar-boton">🗑️</button>
                    </div>
                </div>
            `;

            // Botones de cantidad
            productoEnCarrito.querySelector('.minus').addEventListener('click', () => {
                if (carrito[id].cantidad > 1) {
                    carrito[id].cantidad--;
                    actualizarBoton(id);
                    actualizarCarrito();
                    guardarCarrito();
                }
            });

            productoEnCarrito.querySelector('.plus').addEventListener('click', () => {
                carrito[id].cantidad++;
                actualizarBoton(id);
                actualizarCarrito();
                guardarCarrito();
            });

            productoEnCarrito.querySelector('.carrito-eliminar-boton').addEventListener('click', () => {
                delete carrito[id];
                actualizarBoton(id, true);
                actualizarCarrito();
                guardarCarrito();
            });

            carritoLista.appendChild(productoEnCarrito);
        });

        document.querySelector('.carrito-total').textContent = `Total: £${total.toFixed(2)}`;
        document.querySelector('.carrito-nro').textContent = nroProductos;
    }

    function actualizarBoton(IDproducto, removed = false) {
        const productoCard = document.querySelector(`[data-id="${IDproducto}"]`);
        if (productoCard) {
            const boton = productoCard.querySelector('button');
            if (removed) {
                boton.textContent = 'Comprar';
                boton.classList.remove('agregado');
            } else {
                boton.textContent = `Añadido (${carrito[IDproducto].cantidad})`;
            }
        }
    }

    function guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    // Inicializar carrito y actualizar productos
    inicializarProductosEpoca();
    actualizarCarrito();

    /*
        FUNCIONALIDAD TRES
        Animación fade-in
    */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    // Para todos los productos (época y modernos)
    document.querySelectorAll('.producto-card').forEach(card => {
        observer.observe(card);
    });

    /*
        FUNCIONALIDAD CUATRO
        Productos modernos (fetch API REST)
    */
    async function obtenerProductosModernos() {
        try {
            const respuesta = await fetch('https://fakestoreapi.com/products');
            const productos = await respuesta.json();
            
            const seccionProductosModernos = document.getElementById('productosmodernos');
            const containerProductosModernos = document.createElement('div');
            containerProductosModernos.className = 'container-productos';

            productos.forEach(producto => {
                const IDproducto = `moderno-${producto.id}`;
                const productoCard = document.createElement('article');
                const productoNombre = producto.title.length > 30 ? producto.title.substring(0, 30) + '...' : producto.title;
                productoCard.className = 'producto-card';
                productoCard.dataset.id = IDproducto;
                
                productoCard.innerHTML = `
                    <img src="${producto.image}" alt="${productoNombre}">
                    <h3>${productoNombre}</h3>
                    <a href="#" class="ver-mas">(+) Ver más</a>
                    <p class="descripcion hidden">${producto.description}</p>
                    <span class="precio">£${parseFloat(producto.price).toFixed(2)}</span>
                    <button>${carrito[IDproducto] ? `Añadido (${carrito[IDproducto].cantidad})` : 'Comprar'}</button>
                `;

                if (carrito[IDproducto]) {
                    productoCard.querySelector('button').classList.add('agregado');
                }

                containerProductosModernos.appendChild(productoCard);
            });

            seccionProductosModernos.appendChild(containerProductosModernos);
            mostrarModernos(containerProductosModernos);
        } catch (error) {
            console.error('Error obteniendo productos de API:', error);
        }
    }

    function mostrarModernos(container) {
        // Ver Más para productos modernos
        container.querySelectorAll('.ver-mas').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const descripcion = link.nextElementSibling;
                if (descripcion.classList.contains('hidden')) {
                    descripcion.classList.remove('hidden');
                    link.textContent = '(-) Ver menos';
                } else {
                    descripcion.classList.add('hidden');
                    link.textContent = '(+) Ver más';
                }
            });
        });

        // Carrito para productos modernos
        container.querySelectorAll('.producto-card button').forEach(boton => {
            const productoCard = boton.closest('.producto-card');
            const IDproducto = productoCard.dataset.id;

            boton.addEventListener('click', () => {
                const nombre = productoCard.querySelector('h3').textContent;
                const precio = parseFloat(productoCard.querySelector('.precio').textContent.replace('£', ''));
                const img = productoCard.querySelector('img').src;

                if (!carrito[IDproducto]) {
                    carrito[IDproducto] = {
                        nombre,
                        precio,
                        img,
                        cantidad: 1
                    };
                    boton.classList.add('agregado');
                } else {
                    carrito[IDproducto].cantidad++;
                }

                boton.textContent = `Añadido (${carrito[IDproducto].cantidad})`;
                actualizarCarrito();
                guardarCarrito();
            });
        });
        
        container.querySelectorAll('.producto-card').forEach(card => {
            observer.observe(card);
        });
    }

    // Obtener productos modernos (API) cuando se carga la página
    obtenerProductosModernos();

    function consolaProductosJSON() {
        // Esperar a que todos los productos carguen...
        setTimeout(() => {
            const productosJSON = [];
    
            // Productos de época
            document.querySelectorAll('#productos .producto-card').forEach(producto => {
                productosJSON.push({
                    tipo: 'epoca',
                    id: producto.dataset.id,
                    nombre: producto.querySelector('h3').textContent,
                    descripcion: producto.querySelector('.descripcion').textContent.trim()
                });
            });
    
            // Productos modernos
            document.querySelectorAll('#productosmodernos .producto-card').forEach(producto => {
                productosJSON.push({
                    tipo: 'moderno',
                    id: producto.dataset.id,
                    nombre: producto.querySelector('h3').textContent,
                    descripcion: producto.querySelector('.descripcion').textContent.trim()
                });
            });
    
            // Print por consola como JSON
            console.log(JSON.stringify(productosJSON, null, 2));
        }, 2000); // ... 2 segundos
    }
    
    // Llamar a la función para JSON de productos
    consolaProductosJSON();
});