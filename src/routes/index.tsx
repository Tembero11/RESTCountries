import { Button, Center, FormControl, FormLabel, Spinner } from "@chakra-ui/react";
import { AutoComplete, AutoCompleteGroup, AutoCompleteGroupTitle, AutoCompleteInput, AutoCompleteItem, AutoCompleteList } from "@choc-ui/chakra-autocomplete";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ICountryAutocomplete {
  // Key is region & value is a list of country names
  [key: string]: string[];
}

export default function IndexPage() {
  // Contains all fetched countries
  const [regionsCountries, setRegionsCountries] = useState<ICountryAutocomplete | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCountries() {
      const res = await fetch("https://restcountries.com/v3.1/all", {
        method: "get"
      });

      if (!res.ok) {
        return null;
      }

      const countries = await res.json();

      const regions: ICountryAutocomplete = {};

      for (const country of countries) {
        const region = country.region;
        const commonName = country.name.common;

        if (!Object.hasOwn(regions, region)) {
          regions[region] = [];
        }

        regions[region].push(commonName);
      }
      return regions;
    }
    fetchCountries().then(result => setRegionsCountries(result));
  }, []);

  if (!regionsCountries) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const countryName = (e.target as any).country.value;
    if (!countryName) return;

    navigate(`/country/${countryName}`);
  }


  return (
    <form onSubmit={onSubmit}>
      <Center flexDir="column" gap={4} h="100vh">
        <FormControl maxW="350px">
          <FormLabel>Search a country</FormLabel>
          <AutoComplete openOnFocus>
            <AutoCompleteInput name="country" variant="filled" />
            <AutoCompleteList>
              {Object.entries(regionsCountries).map(([regionName, countryNames], index) => (
                <AutoCompleteGroup key={index} showDivider>
                  <AutoCompleteGroupTitle textTransform="capitalize">
                    {regionName}
                  </AutoCompleteGroupTitle>
                  {countryNames.map((countryName, index) => (
                    <AutoCompleteItem
                      key={index}
                      value={countryName}
                      textTransform="capitalize"
                    >
                      {countryName}
                    </AutoCompleteItem>
                  ))}
                </AutoCompleteGroup>
              ))}
            </AutoCompleteList>
          </AutoComplete>
        </FormControl>

        <Button type="submit">Search</Button>
      </Center>
    </form>
  )
}
