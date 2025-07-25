using CsvHelper;
using System.Globalization;
using System.IO;
using System.Collections.Generic;
using CsvHelper.Configuration;
using System.Text;

namespace StellarDB.Services
{
    public class CsvServices
    {
        public async Task<List<T>> ParseCsvAsync<T>(Stream csvStream)
        {
            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HeaderValidated = null,
                MissingFieldFound = null
            };
            using var reader = new StreamReader(csvStream);
            using var csv = new CsvHelper.CsvReader(reader, config);

            var records = new List<T>();
            await foreach (var record in csv.GetRecordsAsync<T>())
            {
                records.Add(record);
            }

            return records;
        }

        public string ConvertToCsv<T>(List<T> data)
        {
            if (data == null || !data.Any())
            {
                return string.Empty;
            }

            var stringBuilder = new StringBuilder();
            var properties = typeof(T).GetProperties();

            // Write header
            stringBuilder.AppendLine(string.Join(",", properties.Select(p => p.Name)));

            // Rows
            foreach (var item in data)
            {
                var values = properties.Select(p =>
                {
                    var value = p.GetValue(item, null);
                    var stringValue = value?.ToString().Replace("\"", "\"\"") ?? ""; // Escape quotes
                    return $"\"{stringValue}\"";
                });
                stringBuilder.AppendLine(string.Join(",", values));
            }
            return stringBuilder.ToString();
        }
    }
}
