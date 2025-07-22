using CsvHelper;
using System.Globalization;
using System.IO;
using System.Collections.Generic;
using CsvHelper.Configuration;

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
    }
}
