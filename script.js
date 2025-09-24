const cartBtn = document.getElementById("cart");
const cartNum = document.getElementById("cart_num");
const popup = document.getElementById("popup");
const popupClose = document.getElementById("popup_close");
const popupList = document.getElementById("popup_product_list");
const popupCost = document.getElementById("popup_cost");
const checkoutBtn = document.getElementById("checkout_btn");
const clearBtn = document.getElementById("clear_btn");

const orderModal = document.getElementById("order_modal");
const orderClose = document.getElementById("order_close");
const orderCancel = document.getElementById("order_cancel");
const orderForm = document.getElementById("order_form");

// Находим все кнопки "В корзину"
const addToCartButtons = document.querySelectorAll(".card__btn");

let cart = [];

const STORAGE_KEY = "my_shop_cart_v1";

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cart = JSON.parse(raw);
    } else {
      cart = [];
    }
  } catch (e) {
    console.error("Ошибка загрузки корзины:", e);
    cart = [];
  }
  updateCart();
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error("Ошибка сохранения корзины:", e);
  }
}

addToCartButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".card");
    const titleEl = card.querySelector(".card__title");
    const priceEl = card.querySelector(".card__prices");

    const title = titleEl ? titleEl.textContent.trim() : "Товар";
    const price = priceEl ? Number(priceEl.textContent.replace(/\s/g, "")) : 0;

    const id = title.toLowerCase().replace(/\s+/g, "-");

    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.quantity++;
    } else {
      cart.push({ id, title, price, quantity: 1 });
    }

    saveCart();
    updateCart();
  });
});

function updateCart() {
  // Обновляем числовой индикатор
  const totalQuantity = cart.reduce((s, i) => s + i.quantity, 0);
  cartNum.textContent = totalQuantity;

  // Обновляем popup список
  popupList.innerHTML = "";
  let totalPrice = 0;

  if (cart.length === 0) {
    const empty = document.createElement("div");
    empty.textContent = "Корзина пуста";
    empty.style.padding = "12px";
    popupList.appendChild(empty);
  }

  cart.forEach(item => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("popup__item");

    // левая часть: название + контрол количества
    const left = document.createElement("div");
    left.className = "left";

    const name = document.createElement("div");
    name.textContent = item.title;
    name.style.fontWeight = "500";

    const qtyWrap = document.createElement("div");
    qtyWrap.className = "qty";

    const btnMinus = document.createElement("button");
    btnMinus.type = "button";
    btnMinus.className = "qty_minus";
    btnMinus.textContent = "−";
    btnMinus.title = "Уменьшить";

    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.min = "1";
    qtyInput.value = item.quantity;
    qtyInput.setAttribute("aria-label", `Количество ${item.title}`);

    const btnPlus = document.createElement("button");
    btnPlus.type = "button";
    btnPlus.className = "qty_plus";
    btnPlus.textContent = "+";
    btnPlus.title = "Увеличить";

    qtyWrap.appendChild(btnMinus);
    qtyWrap.appendChild(qtyInput);
    qtyWrap.appendChild(btnPlus);

    left.appendChild(name);
    left.appendChild(qtyWrap);

    // правая часть: цена и удалить
    const right = document.createElement("div");
    right.className = "right";

    const priceEl = document.createElement("div");
    priceEl.textContent = formatPrice(item.price * item.quantity);

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove_btn";
    removeBtn.type = "button";
    removeBtn.textContent = "Удалить";

    right.appendChild(priceEl);
    right.appendChild(removeBtn);

    itemDiv.appendChild(left);
    itemDiv.appendChild(right);

    btnMinus.addEventListener("click", () => {
      if (item.quantity > 1) item.quantity--;
      else cart = cart.filter(i => i.id !== item.id);
      saveCart();
      updateCart();
    });

    btnPlus.addEventListener("click", () => {
      item.quantity++;
      saveCart();
      updateCart();
    });

    qtyInput.addEventListener("change", () => {
      let v = Number(qtyInput.value);
      if (!Number.isInteger(v) || v < 1) v = 1;
      item.quantity = v;
      saveCart();
      updateCart();
    });

    removeBtn.addEventListener("click", () => {
      cart = cart.filter(i => i.id !== item.id);
      saveCart();
      updateCart();
    });

    popupList.appendChild(itemDiv);

    totalPrice += item.price * item.quantity;
  });

  popupCost.textContent = formatPrice(totalPrice);
}

function formatPrice(n) {
  if (!isFinite(n)) return "0 ₽";
  return n.toLocaleString("ru-RU") + " ₽";
}

cartBtn.addEventListener("click", () => {
  popup.style.display = "block";
  popup.setAttribute("aria-hidden", "false");
});

popupClose.addEventListener("click", () => {
  popup.style.display = "none";
  popup.setAttribute("aria-hidden", "true");
});

// Закрыть по клику вне контейнера
window.addEventListener("click", (e) => {
  if (e.target === popup) {
    popup.style.display = "none";
    popup.setAttribute("aria-hidden", "true");
  }
});

clearBtn.addEventListener("click", () => {
  if (!confirm("Очистить корзину?")) return;
  cart = [];
  saveCart();
  updateCart();
});

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Корзина пуста!");
    return;
  }
  openOrderModal();
});

function openOrderModal() {
  orderModal.style.display = "flex";
  orderModal.setAttribute("aria-hidden", "false");
  const first = document.getElementById("firstName");
  if (first) first.focus();
}

function closeOrderModal() {
  orderModal.style.display = "none";
  orderModal.setAttribute("aria-hidden", "true");
}

orderClose.addEventListener("click", closeOrderModal);
orderCancel.addEventListener("click", closeOrderModal);

// Закрыть модалку кликом вне диалога
orderModal.addEventListener("click", (e) => {
  if (e.target === orderModal) closeOrderModal();
});

orderForm.addEventListener("submit", function (e) {
  e.preventDefault();


  const firstName = document.getElementById("firstName").value.trim();
  const lastName  = document.getElementById("lastName").value.trim();
  const address   = document.getElementById("address").value.trim();
  const phone     = document.getElementById("phone").value.trim();
  const phonePattern = /^(?:\+7|8)\d{10}$/;

  if (!firstName || !lastName || !address || !phone) {
    alert("Пожалуйста, заполните все поля.");
    return;
  }

  const cleanPhone = phone.replace(/[\s()-]/g, ""); // убираем пробелы, скобки, дефисы

  if (!phonePattern.test(cleanPhone)) {
    alert("Введите корректный номер телефона (начинается с +7 или 8, всего 11 цифр).");
    return;
  }
  alert("Заказ создан!\nСпасибо, мы с вами свяжемся.");

  // очищаем корзину и форму
  cart = [];
  saveCart();
  updateCart();
  closeOrderModal();
  popup.style.display = "none";
  popup.setAttribute("aria-hidden", "true");
  orderForm.reset();
});


loadCart();

