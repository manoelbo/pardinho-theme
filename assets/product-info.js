customElements.get("product-info")||customElements.define("product-info",class extends HTMLElement{quantityInput=void 0;quantityForm=void 0;onVariantChangeUnsubscriber=void 0;cartUpdateUnsubscriber=void 0;abortController=void 0;pendingRequestUrl=null;preProcessHtmlCallbacks=[];postProcessHtmlCallbacks=[];constructor(){super(),this.quantityInput=this.querySelector(".quantity__input")}connectedCallback(){this.initializeProductSwapUtility(),this.onVariantChangeUnsubscriber=subscribe(PUB_SUB_EVENTS.optionValueSelectionChange,this.handleOptionValueChange.bind(this)),this.initQuantityHandlers(),this.dispatchEvent(new CustomEvent("product-info:loaded",{bubbles:!0}))}addPreProcessCallback(t){this.preProcessHtmlCallbacks.push(t)}initQuantityHandlers(){this.quantityInput&&(this.quantityForm=this.querySelector(".product-form__quantity"),this.quantityForm&&(this.setQuantityBoundries(),this.dataset.originalSection||(this.cartUpdateUnsubscriber=subscribe(PUB_SUB_EVENTS.cartUpdate,this.fetchQuantityRules.bind(this)))))}disconnectedCallback(){this.onVariantChangeUnsubscriber(),this.cartUpdateUnsubscriber?.()}initializeProductSwapUtility(){this.preProcessHtmlCallbacks.push((t=>t.querySelectorAll(".scroll-trigger").forEach((t=>t.classList.add("scroll-trigger--cancel"))))),this.postProcessHtmlCallbacks.push((t=>{window?.Shopify?.PaymentButton?.init(),window?.ProductModel?.loadShopifyXR(),publish(PUB_SUB_EVENTS.sectionRefreshed,{data:{sectionId:this.sectionId,resource:{type:SECTION_REFRESH_RESOURCE_TYPE.product,id:t.dataset.productId}}})}))}handleOptionValueChange({data:{event:t,target:e,selectedOptionValues:i}}){if(!this.contains(t.target))return;this.resetProductFormState();const a=e.dataset.productUrl||this.pendingRequestUrl||this.dataset.url,s=this.dataset.url!==a,r=!this.isFeaturedProduct&&s;this.renderProductInfo({requestUrl:this.buildRequestUrlWithParams(a,i,r),targetId:e.id,callback:s?this.handleSwapProduct(a):this.handleUpdateProductInfo(a)})}resetProductFormState(){const t=this.productForm;t?.toggleSubmitButton(!0),t?.handleErrorMessage()}get isFeaturedProduct(){return this.dataset.section.includes("featured_product")}handleSwapProduct(t){return e=>{this.productModal?.remove();const i=this.getSelectedVariant(e.querySelector(`product-info[data-section=${this.sectionId}]`));this.updateURL(t,i?.id),"false"===this.dataset.updateUrl?HTMLUpdateUtility.viewTransition(this,e.querySelector("product-info"),this.preProcessHtmlCallbacks,this.postProcessHtmlCallbacks):(document.querySelector("head title").innerHTML=e.querySelector("head title").innerHTML,HTMLUpdateUtility.viewTransition(document.querySelector("main"),e.querySelector("main"),this.preProcessHtmlCallbacks,this.postProcessHtmlCallbacks))}}renderProductInfo({requestUrl:t,targetId:e,callback:i}){this.abortController?.abort(),this.abortController=new AbortController,this.pendingRequestUrl=t,fetch(t,{signal:this.abortController.signal}).then((t=>t.text())).then((t=>{this.pendingRequestUrl=null;const e=(new DOMParser).parseFromString(t,"text/html");i(e)})).then((()=>{document.querySelector(`#${e}`)?.focus()})).catch((t=>{"AbortError"===t.name?console.log("Fetch aborted by user"):console.error(t)}))}getSelectedVariant(t){const e=t.querySelector("variant-selects [data-selected-variant]")?.innerHTML;return e?JSON.parse(e):null}buildRequestUrlWithParams(t,e,i=!1){const a=[];return!i&&a.push(`section_id=${this.sectionId}`),e.length&&a.push(`option_values=${e.join(",")}`),`${t}?${a.join("&")}`}updateOptionValues(t){const e=t.querySelector("variant-selects");e&&HTMLUpdateUtility.viewTransition(this.variantSelectors,e,this.preProcessHtmlCallbacks)}handleUpdateProductInfo(t){return e=>{const i=this.getSelectedVariant(e);if(this.pickupAvailability?.update(i),this.updateOptionValues(e),this.updateURL(t,i?.id),this.updateVariantInputs(i?.id),!i)return void this.setUnavailable();this.updateMedia(e,i?.featured_media?.id);const a=(t,i=(t=>!1))=>{const a=e.getElementById(`${t}-${this.sectionId}`),s=this.querySelector(`#${t}-${this.dataset.section}`);a&&s&&(s.innerHTML=a.innerHTML,s.classList.toggle("hidden",i(a)))};a("price"),a("Sku",(({classList:t})=>t.contains("hidden"))),a("Inventory",(({innerText:t})=>""===t)),a("Volume"),a("Price-Per-Item",(({classList:t})=>t.contains("hidden"))),this.updateQuantityRules(this.sectionId,e),this.querySelector(`#Quantity-Rules-${this.dataset.section}`)?.classList.remove("hidden"),this.querySelector(`#Volume-Note-${this.dataset.section}`)?.classList.remove("hidden"),this.productForm?.toggleSubmitButton(e.getElementById(`ProductSubmitButton-${this.sectionId}`)?.hasAttribute("disabled")??!0,window.variantStrings.soldOut),publish(PUB_SUB_EVENTS.variantChange,{data:{sectionId:this.sectionId,html:e,variant:i}})}}updateVariantInputs(t){this.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`).forEach((e=>{const i=e.querySelector('input[name="id"]');i.value=t??"",i.dispatchEvent(new Event("change",{bubbles:!0}))}))}updateURL(t,e){this.querySelector("share-button")?.updateUrl(`${window.shopUrl}${t}${e?`?variant=${e}`:""}`),"false"!==this.dataset.updateUrl&&window.history.replaceState({},"",`${t}${e?`?variant=${e}`:""}`)}setUnavailable(){this.productForm?.toggleSubmitButton(!0,window.variantStrings.unavailable);const t=["price","Inventory","Sku","Price-Per-Item","Volume-Note","Volume","Quantity-Rules"].map((t=>`#${t}-${this.dataset.section}`)).join(", ");document.querySelectorAll(t).forEach((({classList:t})=>t.add("hidden")))}updateMedia(t,e){const i=this.querySelector("media-gallery ul"),a=t.querySelector("media-gallery ul"),s=()=>{const t=Array.from(i.querySelectorAll("li[data-media-id]")),e=new Set(t.map((t=>t.dataset.mediaId))),a=new Map(t.map(((t,e)=>[t.dataset.mediaId,{item:t,index:e}])));return[t,e,a]};if(i&&a){let[t,e,r]=s();const n=Array.from(a.querySelectorAll("li[data-media-id]")),o=new Set(n.map((({dataset:t})=>t.mediaId)));let u=!1;for(let t=n.length-1;t>=0;t--)e.has(n[t].dataset.mediaId)||(i.prepend(n[t]),u=!0);for(let e=0;e<t.length;e++)o.has(t[e].dataset.mediaId)||(t[e].remove(),u=!0);u&&([t,e,r]=s()),n.forEach(((a,n)=>{const o=r.get(a.dataset.mediaId);o&&o.index!==n&&(i.insertBefore(o.item,i.querySelector(`li:nth-of-type(${n+1})`)),[t,e,r]=s())}))}if(e){this.querySelector("media-gallery")?.setActiveMedia?.(`${this.dataset.section}-${e}`,!0);const i=this.productModal?.querySelector(".product-media-modal__content"),a=t.querySelector("product-modal .product-media-modal__content");i&&a&&(i.innerHTML=a.innerHTML)}}setQuantityBoundries(){const t={cartQuantity:this.quantityInput.dataset.cartQuantity?parseInt(this.quantityInput.dataset.cartQuantity):0,min:this.quantityInput.dataset.min?parseInt(this.quantityInput.dataset.min):1,max:this.quantityInput.dataset.max?parseInt(this.quantityInput.dataset.max):null,step:this.quantityInput.step?parseInt(this.quantityInput.step):1};let e=t.min;const i=null===t.max?t.max:t.max-t.cartQuantity;null!==i&&(e=Math.min(e,i)),t.cartQuantity>=t.min&&(e=Math.min(e,t.step)),this.quantityInput.min=e,i?this.quantityInput.max=i:this.quantityInput.removeAttribute("max"),this.quantityInput.value=e,publish(PUB_SUB_EVENTS.quantityUpdate,void 0)}fetchQuantityRules(){const t=this.productForm?.variantIdInput?.value;t&&(this.querySelector(".quantity__rules-cart .loading__spinner").classList.remove("hidden"),fetch(`${this.dataset.url}?variant=${t}&section_id=${this.dataset.section}`).then((t=>t.text())).then((t=>{const e=(new DOMParser).parseFromString(t,"text/html");this.updateQuantityRules(this.dataset.section,e)})).catch((t=>console.error(t))).finally((()=>this.querySelector(".quantity__rules-cart .loading__spinner").classList.add("hidden"))))}updateQuantityRules(t,e){this.setQuantityBoundries();const i=e.getElementById(`Quantity-Form-${t}`),a=[".quantity__input",".quantity__rules",".quantity__label"];for(let t of a){const e=this.quantityForm.querySelector(t),a=i.querySelector(t);if(e&&a)if(".quantity__input"===t){const t=["data-cart-quantity","data-min","data-max","step"];for(let i of t){const t=a.getAttribute(i);null!==t?e.setAttribute(i,t):e.removeAttribute(i)}}else e.innerHTML=a.innerHTML}}get productForm(){return this.querySelector("product-form")}get productModal(){return document.querySelector(`#ProductModal-${this.dataset.section}`)}get pickupAvailability(){return this.querySelector("pickup-availability")}get variantSelectors(){return this.querySelector("variant-selects")}get relatedProducts(){const t=SectionId.getIdForSection(SectionId.parseId(this.sectionId),"related-products");return document.querySelector(`product-recommendations[data-section-id^="${t}"]`)}get quickOrderList(){const t=SectionId.getIdForSection(SectionId.parseId(this.sectionId),"quick_order_list");return document.querySelector(`quick-order-list[data-id^="${t}"]`)}get sectionId(){return this.dataset.originalSection||this.dataset.section}});