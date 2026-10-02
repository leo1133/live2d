export const apiGachaData = {
  defaultParams: {
    page: 1,
    items_per_page: 10,
    keyword: "",
    status: 1
  },
  filterParams: {
    status: {
      all: "",
      public: 1,
      private: 2
    },
    keyword: {
      valid: "Test",
      invalid: "NOT_FOUND_9999",
      specialChar: "@#$%"
    }
  },
  expectedResponses: {
    success: {
      status: 200
    }
  }
};

