using ClosedXML.Excel;
using System.Reflection;
using OfficeOpenXml;
using OfficeOpenXml.Style;

namespace StellarDB.Services
{
    public class ExcelServices
    {
        public static List<T> ParseExcel<T>(Stream fileStream) where T : new()
        {
            using var workbook = new XLWorkbook(fileStream);
            var worksheet = workbook.Worksheets.First();
            var rows = worksheet.RowsUsed().ToList();

            if (rows.Count < 2)
                return new List<T>(); // No data rows

            var columnHeaders = rows[0].Cells().Select(c => c.GetString().Trim()).ToList();
            var props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            string Normalize(string s) => s.Replace(" ", "").Replace("_", "").ToLower();
            var propMap = props.ToDictionary(p => Normalize(p.Name), p => p);
            var results = new List<T>();

            foreach (var row in rows.Skip(1))
            {
                var item = new T();
                for (int i = 0; i < columnHeaders.Count; i++)
                {
                    var header = columnHeaders[i];

                    propMap.TryGetValue(header.ToLower(), out var prop);

                    if (prop == null || !prop.CanWrite) continue;

                    var cell = row.Cell(i + 1); // Excel cells are 1-based
                    object? value = null;

                    try
                    {
                        string getPropertyType = prop.PropertyType.ToString();

                        switch (getPropertyType)
                        {
                            case "System.String":
                                value = cell.GetString().Trim();
                                break;
                            case "System.Int32":
                                value = cell.GetValue<int>();
                                break;
                            case "System.Double":
                                value = cell.GetValue<double>();
                                break;
                            case "System.DateTime":
                                value = cell.GetDateTime();
                                break;
                            case "System.Boolean":
                                value = cell.GetBoolean();
                                break;
                            default:
                                value = Convert.ChangeType(cell.Value, prop.PropertyType);
                                break;
                        }
                    }
                    catch
                    {
                        // Skip or log failed conversion
                        Console.WriteLine($"Failed to convert cell value '{cell.Value}' to type '{prop.PropertyType.Name}' for property '{prop.Name}'.");
                        Console.WriteLine($"Row {row.RowNumber()}, Column {i + 1}: Failed to convert...");
                        continue;
                    }

                    prop.SetValue(item, value);
                }

                results.Add(item);
            }

            return results;
        }
        public static byte[] ConvertToExcel<T>(List<T> data)
        {
            // Set the license context using the new EPPlusLicense API  
            ExcelPackage.License.SetNonCommercialPersonal("StellarDB");

            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Export");

            // Add headers  
            var properties = typeof(T).GetProperties();
            for (int col = 0; col < properties.Length; col++)
            {
                worksheet.Cells[1, col + 1].Value = properties[col].Name;
                worksheet.Cells[1, col + 1].Style.Font.Bold = true;
            }

            // Add data  
            for (int row = 0; row < data.Count; row++)
            {
                for (int col = 0; col < properties.Length; col++)
                {
                    worksheet.Cells[row + 2, col + 1].Value = properties[col].GetValue(data[row]);
                }
            }
            worksheet.Cells.AutoFitColumns();

            return package.GetAsByteArray();
        }
    }
}
