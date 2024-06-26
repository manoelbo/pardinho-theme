customElements.get("quick-add-bulk")||customElements.define("quick-add-bulk",class extends BulkAdd{constructor(){super(),this.quantity=this.querySelector("quantity-input");const t=debounce((t=>{0===parseInt(t.target.value)?this.startQueue(t.target.dataset.index,parseInt(t.target.value)):this.validateQuantity(t)}),ON_CHANGE_DEBOUNCE_TIMER);this.addEventListener("change",t.bind(this)),this.listenForActiveInput(),this.listenForKeydown(),this.lastActiveInputId=null;const e=new URLSearchParams(window.location.search);window.pageNumber=decodeURIComponent(e.get("page")||"")}connectedCallback(){this.cartUpdateUnsubscriber=subscribe(PUB_SUB_EVENTS.cartUpdate,(t=>{"quick-add"===t.source||t.cartData.items&&!t.cartData.items.some((t=>t.id===parseInt(this.dataset.index)))||t.cartData.variant_id&&t.cartData.variant_id!==parseInt(this.dataset.index)||this.onCartUpdate().then((()=>{this.listenForActiveInput(),this.listenForKeydown()}))}))}disconnectedCallback(){this.cartUpdateUnsubscriber&&this.cartUpdateUnsubscriber()}getInput(){return this.querySelector("quantity-input input")}selectProgressBar(){return this.querySelector(".progress-bar-container")}listenForActiveInput(){this.classList.contains("hidden")||this.getInput().addEventListener("focusin",(t=>t.target.select())),this.isEnterPressed=!1}listenForKeydown(){this.getInput().addEventListener("keydown",(t=>{"Enter"===t.key&&(this.getInput().blur(),this.isEnterPressed=!0)}))}cleanErrorMessageOnType(t){t.target.addEventListener("keypress",(()=>{t.target.setCustomValidity("")}),{once:!0})}onCartUpdate(){return new Promise(((t,e)=>{fetch(`${this.getSectionsUrl()}?section_id=${this.closest(".collection").dataset.id}`).then((t=>t.text())).then((e=>{const s=(new DOMParser).parseFromString(e,"text/html").querySelector(`#quick-add-bulk-${this.dataset.id}-${this.closest(".collection").dataset.id}`);s&&(this.innerHTML=s.innerHTML),t()})).catch((t=>{console.error(t),e(t)}))}))}updateMultipleQty(t){this.selectProgressBar().classList.remove("hidden");const e=Object.keys(t),s=JSON.stringify({updates:t,sections:this.getSectionsToRender().map((t=>t.section)),sections_url:this.getSectionsUrl()});fetch(`${routes.cart_update_url}`,{...fetchConfig(),body:s}).then((t=>t.text())).then((t=>{const s=JSON.parse(t);this.renderSections(s,e),publish(PUB_SUB_EVENTS.cartUpdate,{source:"quick-add",cartData:s})})).catch((()=>{})).finally((()=>{this.selectProgressBar().classList.add("hidden"),this.requestStarted=!1}))}getSectionsToRender(){return[{id:`quick-add-bulk-${this.dataset.id}-${this.closest(".collection-quick-add-bulk").dataset.id}`,section:this.closest(".collection-quick-add-bulk").dataset.id,selector:`#quick-add-bulk-${this.dataset.id}-${this.closest(".collection-quick-add-bulk").dataset.id}`},{id:"cart-icon-bubble",section:"cart-icon-bubble",selector:".shopify-section"},{id:"CartDrawer",selector:"#CartDrawer",section:"cart-drawer"}]}renderSections(t,e){0===this.queue.filter((t=>e.includes(t.id))).length&&(this.getSectionsToRender().forEach((e=>{const s=document.getElementById(e.id);s&&s.parentElement&&s.parentElement.classList.contains("drawer")&&(t.items.length>0?s.parentElement.classList.remove("is-empty"):s.parentElement.classList.add("is-empty"),setTimeout((()=>{document.querySelector("#CartDrawer-Overlay").addEventListener("click",this.cart.close.bind(this.cart))})));const i=s&&s.querySelector(e.selector)?s.querySelector(e.selector):s;i&&(i.innerHTML=this.getSectionInnerHTML(t.sections[e.section],e.selector))})),this.isEnterPressed&&this.querySelector(`#Quantity-${this.lastActiveInputId}`).select(),this.listenForActiveInput(),this.listenForKeydown())}});