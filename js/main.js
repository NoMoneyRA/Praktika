let eventBus = new Vue()

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
    <div class="product">
      <div class="product-image">
        <img :src="image" :alt="altText"/>
      </div>
      <div class="product-info">
        <h1>{{ title }}</h1>
        <p v-if="inStock">In stock</p>
        <p v-else :class="{ textOutOf: !inStock }">Out of Stock</p>
        <p>{{ sale }}</p>
  
        <product-details :details="details"></product-details>

        <p>Shipping: {{ shipping }}</p>
        <div
          class="color-box"
          v-for="(variant, index) in variants"
          :key="variant.variantId"
          :style="{ backgroundColor: variant.variantColor }"
          @mouseover="updateProduct(index)"
          :class="{ active: selectedVariant === index }"
        ></div>

        <button
          v-on:click="addToCart"
          :disabled="!inStock"
          :class="{ disabledButton: !inStock }"
        >
          Add to cart
        </button>

        <button v-on:click="deleteToCart" :disabled="cart.length === 0">Delete</button>
        
        <br><br>
        <product-tabs :reviews="reviews"></product-tabs>
      </div>
    </div>
  `,
    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            altText: "A pair of socks",
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10,
                    onSale: true
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 10,
                }
            ],
            selectedVariant: 0,
            cart: [],
            reviews: []
        };
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage || './assets/default-image.jpg';
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity > 0;
        },
        sale() {
            const variant = this.variants[this.selectedVariant];
            return variant.onSale ? `${this.brand} ${this.product} is on sale!` : `${this.brand} ${this.product} is not on sale`;
        },
        shipping() {
            return this.premium ? "Free" : 2.99;
        }
    },
    methods: {
        updateProduct(index) {
            this.selectedVariant = index;
        },
        addToCart() {
            const variant = this.variants[this.selectedVariant];
            // Добавляем товар в корзину
            this.cart.push({
                id: variant.variantId,
                color: variant.variantColor,
                image: variant.variantImage
            });
            this.$emit('update-cart', this.cart);
        },
        deleteToCart() {
            this.cart.pop();
            this.$emit('update-cart', this.cart);
        },
    },
    created() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview);
        });
    },
    destroyed() {
        eventBus.$off('review-submitted');
    }
});



Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `
    <div class="product-details">
      <ul>
        <li v-for="(detail, index) in details" :key="index">{{ detail }}</li>
      </ul>
    </div>
  `
});

Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">
      <p v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
          <li v-for="error in errors">{{ error }}</li>
        </ul>
      </p>
      <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name" placeholder="name">
      </p>
      <p>
        <label for="review">Review:</label>
        <textarea id="review" v-model="review"></textarea>
      </p>
      <p>
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </p>
      <p>Would you recommend this product? <br>
        <label for="yes">
          Yes
          <input style="width: auto; align-items: center" type="radio" id="yes" name="recommend" value="Yes" v-model="recommendation"/>
        </label>
        <br>
        <label for="no">
          No
          <input style="width: auto" type="radio" id="no" name="recommend" value="No" v-model="recommendation"/>
        </label>
      </p>
      <p>
        <input type="submit" value="Submit">
      </p>
    </form>
  `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            errors: [],
            recommendation: null,
        };
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommendation: this.recommendation
                };
                eventBus.$emit('review-submitted', productReview);
                this.name = null;
                this.review = null;
                this.rating = null;
                this.recommendation = null;
            } else {
                if (!this.name) this.errors.push("Name required.");
                if (!this.review) this.errors.push("Review required.");
                if (!this.rating) this.errors.push("Rating required.");
                if (!this.recommendation) this.errors.push("Recommendation required.");
            }
        }
    }
});


Vue.component('product-tabs', {
    template: `
     <div>
       <ul>
         <span class="tab"
               :class="{ activeTab: selectedTab === tab }"
               v-for="(tab, index) in tabs"
               @click="selectedTab = tab"
         >{{ tab }}</span>
       </ul>
       <div v-show="selectedTab === 'Reviews'">
         <p v-if="!reviews.length">There are no reviews yet.</p>
         <ul>
           <li v-for="review in reviews">
             <p>{{ review.name }}</p>
             <p>Rating: {{ review.rating }}</p>
             <p>{{ review.review }}</p>
           </li>
         </ul>
       </div>
       <div v-show="selectedTab === 'Make a Review'">
         <product-review></product-review>
       </div>
       <div v-show="selectedTab === 'Shipping'">
         <p>Shipping: {{ shippingCost }}</p>
       </div>
       <div v-show="selectedTab === 'Details'">
         <product-details :details="details"></product-details>
       </div>
     </div>
   `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
            selectedTab: 'Reviews'
        };
    },
    props: {
        reviews: {
            type: Array,
            required: false
        },
        details: {
            type: Array,
            required: false
        },
        shippingCost: {
            type: String,
            required: true
        }
    }
});


Vue.component('cart', {
    props: {
        cart: {
            type: Array,
            required: true
        }
    },
    template: `
    <div class="cart">
  <h2>Your Cart</h2>
  <ul v-if="cart.length > 0">
    <li v-for="(item, index) in cart" :key="index">
      <img :src="item.image" :alt="item.color" width="220" height="100">
      <div>
        <p>{{ item.color }} Socks</p>
        <button @click="removeFromCart(index)">Remove</button>
      </div>
    </li>
  </ul>
  <p v-else class="empty">Your cart is empty.</p>
</div>
  `,
    methods: {
        removeFromCart(index) {
            this.cart.splice(index, 1);
            this.$emit('update-cart', this.cart);
        }
    }
});



let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(newCart) {
            this.cart = newCart;
        }
    },
});



