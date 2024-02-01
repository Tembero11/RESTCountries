import { Button, Center, FormControl, FormLabel, Spinner, Text } from "@chakra-ui/react";
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
  const [regionsCountriesError, setRegionsCountriesError] = useState<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCountries() {
      const res = await fetch("https://restcountries.com/v3.1/all?fields=name,region", {
        method: "get"
      });

      if (!res.ok) {
        throw res.status;
      }

      const countries = await res.json();

      const regions: ICountryAutocomplete = {};

      for (const country of countries) {
        // Country region e.g. Europe
        const region = country.region;
        const commonName = country.name.common;

        // If region is not yet created, create one
        if (!Object.hasOwn(regions, region)) {
          regions[region] = [];
        }

        // Add country name to correct region
        regions[region].push(commonName);
      }
      return regions;
    }
    // Update the result to state
    fetchCountries().then(result => setRegionsCountries(result)).catch(err => setRegionsCountriesError(err));
  }, []);

  if (regionsCountriesError) {
    return (
      <Center h="100vh">
        <Text>An unknown error occured. Code {regionsCountriesError}.</Text>
      </Center>
    )
  }

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
      <Center flexDir="column" gap={4} mt={8}>
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
