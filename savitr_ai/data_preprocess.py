import pandas as pd

file_path = "Post(Post).csv"

df = pd.read_csv(file_path)

df = df.dropna()

df.to_csv(file_path, index=False)
