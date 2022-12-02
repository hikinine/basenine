export class Authorization {
  static Level = {
    Developer: 50,
    Admin: 9,
    Gerente: 7,
    Financeiro: 4,
    HeadOfSales: 3,
    InsideSalesPremium: 2,
    InsideSales: 1,
    Free: 0,
  };

  static has(privilege: number, levelRequired: number) {
    return privilege >= levelRequired;
  }
}
