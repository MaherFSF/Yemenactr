# Yemen Economic Data Research

This document contains the findings of a comprehensive research on Yemen's economic data from 2010-2026, with a focus on the Central Statistical Organization.

## Source Category

Yemen Central Statistical Organization - Census data, surveys, national accounts, all years 2010-2026

## Source URLs

- https://demo2.cso-ye.org/
- https://cso-yemen.org/ (Incorrect website - blog about Yemeni culture)

## Data Quality Notes

The Central Statistical Organization of Yemen's website is outdated, with the most recent data available only up to 2016 for most categories. The website is also poorly maintained, with broken links, corrupted files, and mislabeled documents. For example, the foreign trade bulletin labeled "2008-2013" actually contained data for 2014-2016, and the file for "2014-2016" was corrupted. No data was found for the years 2017-2026. The available data is also very limited in scope.

## Macroeconomic Data

No specific macroeconomic data (GDP, growth rates, inflation) was found on the website.

## Trade Data (2014-2016)

Extracted from `foreign_trade_2008_2013.pdf` (mislabeled).

```json
[
  {
    "year": 2014,
    "exports": 233130670,
    "imports": 1367762560,
    "balance": -1134631890
  },
  {
    "year": 2015,
    "exports": 39442391,
    "imports": 468881760,
    "balance": -429439369
  },
  {
    "year": 2016,
    "exports": 19372742,
    "imports": 545336567,
    "balance": -525963825
  }
]
```

## Social Data (2013-2014)

Extracted from the Labor Force section of the CSO website.

```json
[
  {
    "indicator": "Population (15 years and older)",
    "year": "2013-2014",
    "value": 13378000
  },
  {
    "indicator": "Employment to population ratio",
    "year": "2013-2014",
    "value": 31.4
  },
  {
    "indicator": "Employers",
    "year": "2013-2014",
    "value": 4197000
  }
]
```

## Humanitarian, Financial, and other Data

No data was found for the following categories:
- Humanitarian Data (food security, displacement, health)
- Financial Data (banking, currency, inflation)
