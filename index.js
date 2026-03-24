'use strict';

class Catalogo {
  totalPriceEl = document.getElementById('total-price');
  modalPayment = document.getElementById('pay-form');
  modalCancelPayment = document.getElementById('cancel-payment');
  modalConfirmPayment = document.getElementById('confirm-payment');

  toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
  constructor() {
    this.productos = [
      {
        code: 'P001',
        name: 'Producto 1',
        descripcion: 'Descripción del producto 1',
        price: 19.99,
        id: 1,
      },
      {
        code: 'P002',
        name: 'Producto 2',
        descripcion: 'Descripción del producto 2',
        price: 29.99,
        id: 2,
      },
      {
        code: 'P003',
        name: 'Producto 3',
        descripcion: 'Descripción del producto 3',
        price: 39.99,
        id: 3,
      },
    ];
    this.pedido = [];
    this.renderCatalog();
    this.addEventListenerAddToCart();
    document.getElementById('payment').addEventListener('click', () => {
      if (this.pedido.length > 0) {
        this.modalPayment.showModal();
      }
    });
    this.modalCancelPayment.addEventListener('click', () => {
      this.modalPayment.close();
    });
    this.modalConfirmPayment.addEventListener('click', () => {
      this.modalPayment.close();
      this.toast.fire({
        icon: 'success',
        title: 'Pago confirmado. Gracias por su compra.',
      });
      this.pedido = [];
      this.totalPriceEl.textContent = '$0.00';
      document.querySelector('.cart tbody').innerHTML = '';
    });
  }

  addListenerRemoveFromCart() {
    document.querySelectorAll('.remove-from-cart').forEach((button) => {
      button.addEventListener('click', (event) => {
        const productId = parseInt(event.target.getAttribute('data-id'), 10);
        this.removeFromCart(productId);
        this.totalPriceEl.textContent = `$${this.calTotal().toFixed(2)}`;
      });
    });
  }

  addListenerQuantityChange() {
    document.querySelectorAll('.quantity-input').forEach((input) => {
      input.addEventListener('input', (event) => {
        const productId = parseInt(event.target.getAttribute('data-id'), 10);
        const quantity = parseInt(event.target.value, 10);
        if (isNaN(quantity) || quantity < 1) {
          event.target.value = 1;
          return;
        }
        this.onChangeQuantity(productId, quantity);
        this.totalPriceEl.textContent = `$${this.calTotal().toFixed(2)}`;
      });
    });
  }

  cleanListenerQuantityChange() {
    document.querySelectorAll('.quantity-input').forEach((input) => {
      input.replaceWith(input.cloneNode(true));
    });
  }

  onChangeQuantity(productId, quantity) {
    const product = this.pedido.find((p) => p.id === productId);
    if (product) {
      product.quantity = quantity;
      this.rendererCartContent(product.id);
    }
  }

  renderCatalog() {
    this.productos.forEach((product) => {
      this.appendToCatalogo(product);
    });
  }

  /**
   * @param {Object} product - El producto a agregar al catálogo.
   * @returns {string} - El HTML del componente del producto.
   */
  componentHTML(product) {
    return `
            <div class="product">
          <div class="content">
            <div class="description">
              <h2>${product.code} - ${product.name}</h2>
              <p>
                ${product.descripcion}
              </p>
              <p>Precio: $${product.price}</p>
            </div>
            <div class="images">
              <div class="img-main">
                <img
                  src="data:image/jpeg;base64,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"
                  alt="Producto 1"
                />
              </div>
              <div class="img-secondary">
                <img
                  src="https://emprendepyme.net/wp-content/uploads/2023/03/cualidades-producto-1200x675.jpg"
                  alt=""
                />
                <img
                  src="https://concepto.de/wp-content/uploads/2019/11/producto-e1572738593909.jpg"
                  alt=""
                />
              </div>
            </div>
          </div>
          <div class="action">
            <button class="add-to-cart" data-id="${product.id}">
              <i class="pi pi-cart-plus"></i>
              Agregar al carrito
            </button>
          </div>
        </div>
        `;
  }

  addEventListenerAddToCart() {
    document.querySelectorAll('.add-to-cart').forEach((button) => {
      button.addEventListener('click', (event) => {
        const productId = parseInt(event.target.getAttribute('data-id'), 10);
        this.addToKart(productId);
      });
    });
  }

  appendToCatalogo(product) {
    const catalogoContainer = document.getElementsByClassName('catalogo')[0];
    const productHTML = this.componentHTML(product);
    catalogoContainer.insertAdjacentHTML('beforeend', productHTML);
  }

  addToKart(productId) {
    if (this.pedido.some((product) => product.id === productId)) {
      this.toast.fire({
        icon: 'warning',
        title: 'El producto ya está en el carrito.',
      });
      return;
    }
    this.pedido.push({
      ...this.productos.find((product) => product.id === productId),
      quantity: 1,
    });
    this.rendererCartContent();
    this.totalPriceEl.textContent = `$${this.calTotal().toFixed(2)}`;
  }

  numberOrZero(value) {
    if (isNaN(value) || value === '') {
      return 0;
    }
    return parseFloat(value).toFixed(2);
  }

  /**
   * @param {number|null} focus - El ID del producto que se ha actualizado, o null si no se ha actualizado ningún producto.
   *  @returns {void}
   */
  rendererCartContent(focus = null) {
    const cartRow = (product) => {
      const subtotal = this.calRowSubtotal(product);
      const total = this.calcRowTotal(product);
      return `
        <tr data-id="${product.id}">
          <td>${product.code}</td>
          <td>${product.name}</td>
          <td>
            <input type="number" value="${product.quantity ?? 1}" min="1" class="quantity-input" data-id="${product.id}" />
          </td>
          <td>$${product.price.toFixed(2)}</td>
          <td>$${this.numberOrZero(subtotal)}</td>
          <td data-value=".16"> 16% </td>
          <td>$${this.numberOrZero(total)}</td>
          <td>
            <button class="remove-from-cart btn-icon" data-id="${product.id}" title="Eliminar">
              <i class="pi pi-trash remove-from-cart" title="Eliminar" data-id="${product.id}"></i>
            </button>
          </td>
        </tr>`;
    };
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = '';
    this.pedido.forEach((product) => {
      cartContainer.insertAdjacentHTML('beforeend', cartRow(product));
    });
    this.addListenerQuantityChange();
    this.addListenerRemoveFromCart();
    if (focus) {
      const input = document.querySelector(
        `.quantity-input[data-id="${focus}"]`,
      );
      if (input) {
        input.focus();
      }
    }
  }

  removeFromCart(productId) {
    this.pedido = this.pedido.filter((product) => product.id !== productId);
    this.rendererCartContent();
  }

  calRowSubtotal(row) {
    return row.price * row.quantity;
  }

  calcRowTotal(row) {
    return this.calRowSubtotal(row) + this.calcIVA(this.calRowSubtotal(row));
  }

  calTotal() {
    return this.pedido.reduce((total, product) => {
      return total + this.calcRowTotal(product);
    }, 0);
  }

  calcIVA(amount) {
    return amount * 0.16;
  }

  pay() {}
}
