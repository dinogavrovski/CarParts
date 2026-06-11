class BaseScraper {
  constructor(storeName, baseUrl) {
    this.storeName = storeName;
    this.baseUrl = baseUrl;
  }

  /** @returns {Promise<Array<{brand: string, model: string, categoryPageUrl: string}>>} */
  async scrapeVehicles() {
    throw new Error('scrapeVehicles() must be implemented');
  }

  /**
   * @param {string} vehiclePageUrl
   * @returns {Promise<Array<{title, price, currency, availability, productUrl}>>}
   */
  async scrapeListings(vehiclePageUrl) {
    throw new Error('scrapeListings() must be implemented');
  }
}

module.exports = BaseScraper;
