import json
import math
import random


class ZybotRNN:
    """
    A small, character-level recurrent neural network.

    Trains on explicit input/output pairs using backpropagation
    through time. Uses only the Python standard library.

    This is an experimental language model, not a general-purpose
    reasoning model.
    """

    SEPARATOR = "\nOUTPUT:\n"

    def __init__(
        self,
        vocab,
        hidden_size=24,
        learning_rate=0.03,
        seed=42,
    ):
        self.vocab = list(vocab)
        self.hidden_size = int(hidden_size)
        self.learning_rate = float(learning_rate)

        self.char_to_id = {
            char: index
            for index, char in enumerate(self.vocab)
        }
        self.id_to_char = {
            index: char
            for index, char in enumerate(self.vocab)
        }

        # EOS is a separate token, not a printable character.
        self.eos_id = len(self.vocab)
        self.vocab_size = len(self.vocab) + 1

        rng = random.Random(seed)
        scale = 0.05

        self.Wxh = [
            [rng.uniform(-scale, scale) for _ in range(self.vocab_size)]
            for _ in range(self.hidden_size)
        ]
        self.Whh = [
            [rng.uniform(-scale, scale) for _ in range(self.hidden_size)]
            for _ in range(self.hidden_size)
        ]
        self.Why = [
            [rng.uniform(-scale, scale) for _ in range(self.hidden_size)]
            for _ in range(self.vocab_size)
        ]

        self.bh = [0.0] * self.hidden_size
        self.by = [0.0] * self.vocab_size

    def _softmax(self, logits):
        maximum = max(logits)
        values = [
            math.exp(max(-60.0, value - maximum))
            for value in logits
        ]
        total = sum(values)

        if total == 0.0:
            return [1.0 / len(values)] * len(values)

        return [value / total for value in values]

    def _forward(self, inputs):
        hidden_states = []
        previous_states = []
        probabilities = []

        hidden = [0.0] * self.hidden_size

        for token in inputs:
            previous_states.append(hidden)

            current = []

            for h in range(self.hidden_size):
                value = self.bh[h] + self.Wxh[h][token]

                for j in range(self.hidden_size):
                    value += self.Whh[h][j] * hidden[j]

                current.append(math.tanh(value))

            hidden = current
            hidden_states.append(hidden)

            logits = []

            for i in range(self.vocab_size):
                value = self.by[i]

                for h in range(self.hidden_size):
                    value += self.Why[i][h] * hidden[h]

                logits.append(value)

            probabilities.append(self._softmax(logits))

        return hidden_states, previous_states, probabilities

    def train_example(self, input_text, output_text):
        """
        Train on one input/output pair.

        The loss is applied to the output text and EOS token.
        The input and separator provide context but are not targets.
        """

        if not input_text or not output_text:
            return 0.0

        prefix = input_text + self.SEPARATOR

        prefix_ids = [
            self.char_to_id[char]
            for char in prefix
            if char in self.char_to_id
        ]

        output_ids = [
            self.char_to_id[char]
            for char in output_text
            if char in self.char_to_id
        ]

        if not prefix_ids or not output_ids:
            return 0.0

        sequence = prefix_ids + output_ids + [self.eos_id]

        inputs = sequence[:-1]
        targets = sequence[1:]

        # Predict output characters and EOS, not the input prefix.
        first_target_position = len(prefix_ids) - 1
        target_positions = range(first_target_position, len(targets))

        hidden_states, previous_states, probabilities = self._forward(
            inputs
        )

        loss = 0.0
        target_count = 0

        for t in target_positions:
            probability = max(probabilities[t][targets[t]], 1e-12)
            loss -= math.log(probability)
            target_count += 1

        if target_count == 0:
            return 0.0

        # Allocate gradients.
        grad_Wxh = [
            [0.0] * self.vocab_size
            for _ in range(self.hidden_size)
        ]
        grad_Whh = [
            [0.0] * self.hidden_size
            for _ in range(self.hidden_size)
        ]
        grad_Why = [
            [0.0] * self.hidden_size
            for _ in range(self.vocab_size)
        ]

        grad_bh = [0.0] * self.hidden_size
        grad_by = [0.0] * self.vocab_size

        dh_next = [0.0] * self.hidden_size

        # Backpropagation through time.
        for t in range(len(inputs) - 1, -1, -1):
            output_is_target = t >= first_target_position

            dh = dh_next[:]

            if output_is_target:
                error = probabilities[t][:]

                error[targets[t]] -= 1.0

                for i in range(self.vocab_size):
                    grad_by[i] += error[i]

                    for h in range(self.hidden_size):
                        grad_Why[i][h] += (
                            error[i] * hidden_states[t][h]
                        )

                for h in range(self.hidden_size):
                    for i in range(self.vocab_size):
                        dh[h] += self.Why[i][h] * error[i]

            hidden = hidden_states[t]
            previous = previous_states[t]

            da = [
                dh[h] * (1.0 - hidden[h] * hidden[h])
                for h in range(self.hidden_size)
            ]

            for h in range(self.hidden_size):
                grad_bh[h] += da[h]
                grad_Wxh[h][inputs[t]] += da[h]

                for j in range(self.hidden_size):
                    grad_Whh[h][j] += da[h] * previous[j]

            dh_previous = [0.0] * self.hidden_size

            for j in range(self.hidden_size):
                value = 0.0

                for h in range(self.hidden_size):
                    value += self.Whh[h][j] * da[h]

                dh_previous[j] = value

            dh_next = dh_previous

        # Average gradients over predicted output tokens.
        scale = 1.0 / target_count

        gradients = (
            grad_Wxh,
            grad_Whh,
            grad_Why,
            grad_bh,
            grad_by,
        )

        # Global gradient clipping helps prevent unstable updates.
        squared_norm = 0.0

        for matrix in gradients[:3]:
            for row in matrix:
                for value in row:
                    squared_norm += (value * scale) ** 2

        for vector in gradients[3:]:
            for value in vector:
                squared_norm += (value * scale) ** 2

        norm = math.sqrt(squared_norm)
        clip_scale = 1.0

        if norm > 5.0:
            clip_scale = 5.0 / norm

        update_scale = scale * clip_scale
        rate = self.learning_rate

        for h in range(self.hidden_size):
            for i in range(self.vocab_size):
                self.Wxh[h][i] -= (
                    rate * grad_Wxh[h][i] * update_scale
                )

            for j in range(self.hidden_size):
                self.Whh[h][j] -= (
                    rate * grad_Whh[h][j] * update_scale
                )

            self.bh[h] -= rate * grad_bh[h] * update_scale

        for i in range(self.vocab_size):
            for h in range(self.hidden_size):
                self.Why[i][h] -= (
                    rate * grad_Why[i][h] * update_scale
                )

            self.by[i] -= rate * grad_by[i] * update_scale

        return loss / target_count

    def _advance(self, token, hidden):
        current = []

        for h in range(self.hidden_size):
            value = self.bh[h] + self.Wxh[h][token]

            for j in range(self.hidden_size):
                value += self.Whh[h][j] * hidden[j]

            current.append(math.tanh(value))

        return current

    def generate(
        self,
        prompt,
        max_length=300,
        temperature=0.25,
        seed=42,
    ):
        """
        Generate only the response continuation.

        The input is followed by the same separator used in training.
        """

        if not prompt:
            return ""

        temperature = max(temperature, 0.05)
        max_length = max(0, min(int(max_length), 1000))

        prefix = prompt + self.SEPARATOR
        hidden = [0.0] * self.hidden_size

        # Encode the complete input and separator.
        for char in prefix:
            token = self.char_to_id.get(char)

            if token is not None:
                hidden = self._advance(token, hidden)

        rng = random.Random(seed)
        result = []

        for _ in range(max_length):
            logits = []

            for i in range(self.vocab_size):
                value = self.by[i]

                for h in range(self.hidden_size):
                    value += self.Why[i][h] * hidden[h]

                logits.append(value / temperature)

            probabilities = self._softmax(logits)

            token = rng.choices(
                range(self.vocab_size),
                weights=probabilities,
                k=1,
            )[0]

            if token == self.eos_id:
                break

            char = self.id_to_char[token]
            result.append(char)

            hidden = self._advance(token, hidden)

        return "".join(result).strip()

    def save(self, path):
        data = {
            "format_version": 2,
            "vocab": self.vocab,
            "hidden_size": self.hidden_size,
            "learning_rate": self.learning_rate,
            "Wxh": self.Wxh,
            "Whh": self.Whh,
            "Why": self.Why,
            "bh": self.bh,
            "by": self.by,
        }

        with open(path, "w", encoding="utf-8") as file:
            json.dump(data, file, separators=(",", ":"))

    @classmethod
    def load(cls, path):
        with open(path, "r", encoding="utf-8") as file:
            data = json.load(file)

        if data.get("format_version") != 2:
            raise ValueError(
                "This brain uses an older model format. "
                "Retrain it with the current train.py."
            )

        model = cls(
            vocab=data["vocab"],
            hidden_size=data["hidden_size"],
            learning_rate=data["learning_rate"],
        )

        model.Wxh = data["Wxh"]
        model.Whh = data["Whh"]
        model.Why = data["Why"]
        model.bh = data["bh"]
        model.by = data["by"]

        return model
