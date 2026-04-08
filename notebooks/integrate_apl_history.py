"""
Integrate 9 years of historical APL data (2015-2023) into communes_master.parquet.
Sources:
  - apl_historical/*.xlsx sheets APL_2015..APL_2022
  - apl.xlsx sheet "APL 2023"
"""

import pandas as pd
import pathlib

DATA_RAW = pathlib.Path(__file__).parent / "data" / "raw"
PROCESSED = pathlib.Path(__file__).parent / "data" / "processed"

HIST_FILE = DATA_RAW / "apl_historical" / "Indicateur d'accessibilité potentielle localisée (APL) aux médecins généralistes.xlsx"
APL_2023_FILE = DATA_RAW / "apl.xlsx"

YEARS_HIST = [2015, 2016, 2017, 2018, 2019, 2021, 2022]
SHEET_MAP = {y: f"APL_{y}" for y in YEARS_HIST}
SHEET_MAP[2023] = "APL 2023"

ALL_YEARS = YEARS_HIST + [2023]


def load_apl_sheet(filepath, sheet_name, year):
    df = pd.read_excel(filepath, sheet_name=sheet_name, skiprows=10, header=None,
                       usecols=[0, 2], dtype={0: str})
    df.columns = ["code_commune", f"apl_{year}"]
    df["code_commune"] = df["code_commune"].astype(str).str.zfill(5)
    df[f"apl_{year}"] = pd.to_numeric(df[f"apl_{year}"], errors="coerce")
    df = df.dropna(subset=["code_commune"])
    df = df[df["code_commune"].str.match(r"^\d{5}$")]
    return df.set_index("code_commune")


def main():
    frames = []

    for year in YEARS_HIST:
        print(f"Loading APL {year} from historical file...")
        frames.append(load_apl_sheet(HIST_FILE, SHEET_MAP[year], year))

    print("Loading APL 2023 from apl.xlsx...")
    frames.append(load_apl_sheet(APL_2023_FILE, SHEET_MAP[2023], 2023))

    merged = pd.concat(frames, axis=1)
    print(f"APL history: {merged.shape[0]} communes, {merged.shape[1]} year-columns")

    parquet_path = PROCESSED / "communes_master.parquet"
    master = pd.read_parquet(parquet_path)
    print(f"Master parquet: {master.shape[0]} communes, {master.shape[1]} columns")

    # Drop old apl_evolution column and any existing apl_YYYY columns that we'll replace
    cols_to_drop = ["apl_evolution"]
    for y in ALL_YEARS:
        col = f"apl_{y}"
        if col in master.columns:
            cols_to_drop.append(col)
    master = master.drop(columns=[c for c in cols_to_drop if c in master.columns])

    # Left join
    master = master.merge(merged, left_on="code_commune", right_index=True, how="left")

    # Rebuild apl_evolution as dict column
    def build_evo(row):
        evo = {}
        for y in ALL_YEARS:
            col = f"apl_{y}"
            if col in row.index and pd.notna(row[col]):
                evo[str(y)] = round(float(row[col]), 2)
        return evo if evo else None

    master["apl_evolution"] = master.apply(build_evo, axis=1)

    print(f"Final parquet: {master.shape[0]} communes, {master.shape[1]} columns")

    # Spot checks
    for code, name in [("78646", "Versailles"), ("92048", "Meudon")]:
        row = master[master["code_commune"] == code]
        if not row.empty:
            evo = row.iloc[0]["apl_evolution"]
            print(f"  {name} ({code}): apl_evolution = {evo}")

    master.to_parquet(parquet_path, index=False)
    print(f"Saved to {parquet_path}")


if __name__ == "__main__":
    main()
