import json
import math
import random


class ZybotRNN:

    def __init__(
        self,
        vocab,
        hidden_size=64,
        learning_rate=0.03,
        seed=42
    ):
        self.vocab = vocab
        self.hidden_size = hidden_size
        self.learning_rate = learning_rate

        random.seed(seed)

        self.vocab_size = len(vocab)

        self.char_to_id = {
            char: i
            for i, char in enumerate(vocab)
        }

        self.id_to_char = {
            i: char
            for i, char in enumerate(vocab)
        }

        scale = 0.05

        self.Wxh = [
            [
                random.uniform(-scale, scale)
                for _ in range(self.vocab_size)
            ]
            for _ in range(hidden_size)
        ]

        self.Whh = [
            [
                random.uniform(-scale, scale)
                for _ in range(hidden_size)
            ]
            for _ in range(hidden_size)
        ]

        self.Why = [
            [
                random.uniform(-scale, scale)
                for _ in range(hidden_size)
            ]
            for _ in range(self.vocab_size)
        ]

        self.bh = [0.0] * hidden_size
        self.by = [0.0] * self.vocab_size

    def _softmax(self, values):

        maximum = max(values)

        exponentials = [
            math.exp(value - maximum)
            for value in values
        ]

        total = sum(exponentials)

        return [
            value / total
            for value in exponentials
        ]

    def _forward(self, inputs):

        hidden_states = []
        probabilities = []

        hidden = [0.0] * self.hidden_size

        for token in inputs:

            x = [0.0] * self.vocab_size

            x[token] = 1.0

            new_hidden = []

            for h in range(self.hidden_size):

                value = self.bh[h]

                for i in range(self.vocab_size):
                    value += self.Wxh[h][i] * x[i]

                for j in range(self.hidden_size):
                    value += self.Whh[h][j] * hidden[j]

                new_hidden.append(math.tanh(value))

            hidden = new_hidden

            output = []

            for i in range(self.vocab_size):

                value = self.by[i]

                for h in range(self.hidden_size):
                    value += self.Why[i][h] * hidden[h]

                output.append(value)

            probabilities.append(self._softmax(output))
            hidden_states.append(hidden)

        return hidden_states, probabilities

    def train_example(self, text, epochs=1):

        if len(text) < 2:
            return 0.0

        ids = [
            self.char_to_id[char]
            for char in text
            if char in self.char_to_id
        ]

        if len(ids) < 2:
            return 0.0

        total_loss = 0.0

        for _ in range(epochs):

            inputs = ids[:-1]
            targets = ids[1:]

            hidden_states, probabilities = self._forward(inputs)

            loss = 0.0

            for probability, target in zip(
                probabilities,
                targets
            ):
                probability = max(
                    probability[target],
                    1e-12
                )

                loss -= math.log(probability)

            total_loss += loss

            # Simple output-layer learning.
            #
            # V0.1 intentionally keeps the training system small.
            # We will replace this with full backpropagation through
            # time in the next neural milestone.

            for t, target in enumerate(targets):

                probability = probabilities[t]
                hidden = hidden_states[t]

                error = probability[:]
                error[target] -= 1.0

                for i in range(self.vocab_size):

                    for h in range(self.hidden_size):

                        self.Why[i][h] -= (
                            self.learning_rate
                            * error[i]
                            * hidden[h]
                        )

                    self.by[i] -= (
                        self.learning_rate
                        * error[i]
                    )

        return total_loss / max(1, len(targets))

    def generate(
        self,
        prompt,
        max_length=300,
        temperature=0.8
    ):

        hidden = [0.0] * self.hidden_size

        generated = prompt

        for char in prompt:

            token = self.char_to_id.get(char)

            if token is None:
                continue

            x = [0.0] * self.vocab_size
            x[token] = 1.0

            new_hidden = []

            for h in range(self.hidden_size):

                value = self.bh[h]

                for i in range(self.vocab_size):
                    value += self.Wxh[h][i] * x[i]

                for j in range(self.hidden_size):
                    value += self.Whh[h][j] * hidden[j]

                new_hidden.append(math.tanh(value))

            hidden = new_hidden

        for _ in range(max_length):

            last_char = generated[-1]

            token = self.char_to_id.get(last_char)

            if token is None:
                break

            x = [0.0] * self.vocab_size
            x[token] = 1.0

            new_hidden = []

            for h in range(self.hidden_size):

                value = self.bh[h]

                for i in range(self.vocab_size):
                    value += self.Wxh[h][i] * x[i]

                for j in range(self.hidden_size):
                    value += self.Whh[h][j] * hidden[j]

                new_hidden.append(math.tanh(value))

            hidden = new_hidden

            logits = []

            for i in range(self.vocab_size):

                value = self.by[i]

                for h in range(self.hidden_size):
                    value += self.Why[i][h] * hidden[h]

                logits.append(
                    value / max(temperature, 0.05)
                )

            probabilities = self._softmax(logits)

            token = random.choices(
                range(self.vocab_size),
                weights=probabilities
            )[0]

            next_char = self.id_to_char[token]

            generated += next_char

        return generated

    def save(self, path):

        data = {
            "vocab": self.vocab,
            "hidden_size": self.hidden_size,
            "learning_rate": self.learning_rate,
            "Wxh": self.Wxh,
            "Whh": self.Whh,
            "Why": self.Why,
            "bh": self.bh,
            "by": self.by
        }

        with open(
            path,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                data,
                file
            )

    @classmethod
    def load(cls, path):

        with open(
            path,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(file)

        model = cls(
            data["vocab"],
            data["hidden_size"],
            data["learning_rate"]
        )

        model.Wxh = data["Wxh"]
        model.Whh = data["Whh"]
        model.Why = data["Why"]
        model.bh = data["bh"]
        model.by = data["by"]

        return model
