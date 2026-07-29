export interface HousingSalePrice {
  id: number
  year: number
  areaName: string
  areaCode: string
  areaType: string
  sumFloorAreaSold: number
  sumSalePrice: number
  numberSales: number
  pricePerM2: number
  numberBc: number | null
  costPerM2: number | null
  sumValueNew: number | null
  pcr: number | null
}
